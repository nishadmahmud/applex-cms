"use client";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  useGetPurchaseProductsQuery,
  useSearchPurchaseProductsMutation,
} from "@/app/store/api/purchaseReturnApi";

export default function StepSelectInvoice({
  invoices,
  selectedInvoice,
  setSelectedInvoice,
  searchInvoice,
  selectedProducts,
  setSelectedProducts,
  onClose,
  onNext,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productKeyword, setProductKeyword] = useState("");
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchProducts] = useSearchPurchaseProductsMutation();
  const { data: initProducts } = useGetPurchaseProductsQuery({
    page: 1,
    limit: 20,
  });

  const allProducts =
    productKeyword.trim().length > 0
      ? undefined
      : initProducts?.data?.data || [];

  const styles = {
    control: (base, s) => ({
      ...base,
      minHeight: 44,
      borderRadius: 8,
      backgroundColor: "#fafafa",
      borderColor: s.isFocused ? "#059669" : "#e5e7eb",
      boxShadow: "none",
      "&:hover": { borderColor: "#059669" },
    }),
    menu: (b) => ({ ...b, zIndex: 55 }),
  };

  useEffect(() => {
    if (invoices?.length) {
      const mapped = invoices.map((inv) => ({
        value: inv.invoice_id,
        label: inv.invoice_id,
        data: inv,
      }));
      setInvoiceOptions(mapped);
    }
  }, [invoices]);

  const productSearchTimer = useRef();
  const invoiceSearchTimer = useRef();
  const [productOptions, setProductOptions] = useState([]);

  const handleProductInput = (input, meta) => {
    if (meta.action !== "input-change") return;
    setProductKeyword(input);
    clearTimeout(productSearchTimer.current);
    if (!input.trim()) return;
    productSearchTimer.current = setTimeout(() => {
      searchProducts({ keyword: input })
        .unwrap()
        .then((res) => {
          const items = res?.data?.data || [];
          setProductOptions(
            items.map((p) => ({
              value: p.id,
              label: p.name,
              data: p,
            }))
          );
        })
        .catch(() => { });
    }, 400);
  };

  const productList = productKeyword.trim()
    ? productOptions
    : (allProducts || []).map((p) => ({
      value: p.id,
      label: p.name,
      data: p,
    }));

  const handleProductChange = async (opt) => {
    const product = opt?.data;
    setSelectedProduct(product || null);
    setSelectedInvoice(null);
    if (product) {
      try {
        const res = await searchInvoice({
          keyword: "",
          product_id: product.id,
        }).unwrap();
        const invs =
          res?.data?.data?.map((v) => ({
            value: v.invoice_id,
            label: v.invoice_id,
            data: v,
          })) || [];
        setInvoiceOptions(invs);
      } catch (e) {
        console.error(e);
      }
    } else {
      const mapped = invoices.map((inv) => ({
        value: inv.invoice_id,
        label: inv.invoice_id,
        data: inv,
      }));
      setInvoiceOptions(mapped);
    }
  };

  const toggleProductSelect = (item) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item]
    );
  };

  const toggleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) setSelectedProducts(selectedInvoice?.purchase_details || []);
    else setSelectedProducts([]);
  };

  const proceed = () => {
    if (!selectedInvoice || !selectedProducts.length) {
      toast.warning("Select invoice and at least one product.");
      return;
    }
    const mapped = selectedProducts.map((p) => ({
      id: p.id,
      product_id: p.product_id,
      details_id: p.id,
      imei:
        p.product_info?.have_variant && p.product_imei?.length
          ? p.product_imei[0]?.imei
          : null,
      is_variant: Boolean(p.product_info?.have_variant),
      return_qty: Number(p.qty || 1),
      purchase_qty: Number(p.qty || 1),
      // pull unit price from item.price OR from product_info.purchase_price
      return_unit_price: Number(p.price || p.product_info?.purchase_price || 0),
      price: Number(p.price || p.product_info?.purchase_price || 0),
      return_amount:
        Number(p.price || p.product_info?.purchase_price || 0) *
        Number(p.qty || 1),
      discount_type: "Fixed",
      discount: 0,
      return_stock_status: 0,
    }));
    onNext(mapped);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-700">
          Select Product
          <span className="text-gray-400 font-normal">(to filter invoice)</span>
        </label>
        <Select
          styles={styles}
          placeholder="Search or select product"
          options={productList}
          onInputChange={handleProductInput}
          onChange={handleProductChange}
          value={
            selectedProduct
              ? { value: selectedProduct.id, label: selectedProduct.name }
              : null
          }
          isSearchable
          isClearable
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-700">
          Select Purchase Invoice
        </label>
        <Select
          styles={styles}
          placeholder="Type invoice ID to search..."
          options={invoiceOptions}
          onInputChange={(input, meta) => {
            if (meta.action !== "input-change") return;
            clearTimeout(invoiceSearchTimer.current);
            if (!input.trim()) {
              // Reset to default list
              const mapped = invoices.map((inv) => ({
                value: inv.invoice_id,
                label: inv.invoice_id,
                data: inv,
              }));
              setInvoiceOptions(mapped);
              return;
            }
            invoiceSearchTimer.current = setTimeout(() => {
              searchInvoice({ keyword: input })
                .unwrap()
                .then((res) => {
                  const invs =
                    res?.data?.data?.map((v) => ({
                      value: v.invoice_id,
                      label: v.invoice_id,
                      data: v,
                    })) || [];
                  setInvoiceOptions(invs);
                })
                .catch(() => { });
            }, 400);
          }}
          onChange={(opt) => {
            setSelectedInvoice(opt?.data || null);
            setSelectedProducts([]);
            setSelectAll(false);
          }}
          value={
            selectedInvoice
              ? {
                value: selectedInvoice.invoice_id,
                label: selectedInvoice.invoice_id,
              }
              : null
          }
          isSearchable
          isClearable
          filterOption={() => true}
        />
      </div>

      {selectedInvoice && (
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">
              Purchased Products
            </h4>
            <span className="text-xs text-gray-400">
              {new Date(selectedInvoice.created_at).toLocaleString()}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="p-2 text-center">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-center p-2">Unit Price</th>
                  <th className="text-center p-2">Qty</th>
                  <th className="text-center p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.purchase_details?.map((item) => {
                  const img =
                    item.product_info?.image_path ||
                    item.product_info?.image_paths?.[0];
                  const imei =
                    item.product_info?.have_variant && item.product_imei?.length
                      ? item.product_imei[0].imei
                      : null;

                  // ensure price & qty are numbers
                  const unitPrice = Number(item.price || 0);
                  const qty = Number((item.remaining_qty) || 0);
                  const total = unitPrice * qty;

                  return (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="text-center">
                        <Checkbox
                          checked={selectedProducts.some(
                            (p) => p.id === item.id
                          )}
                          onCheckedChange={() => toggleProductSelect(item)}
                        />
                      </td>

                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {img && (
                            <img
                              src={img}
                              alt=""
                              className="w-10 h-10 rounded object-cover border"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {item.product_info?.name}
                            </div>
                            {imei && (
                              <div className="text-xs text-gray-500">
                                <span className="bg-emerald-50 text-emerald-600 px-1.5 py-[1px] rounded">
                                  Variant Product
                                </span>{" "}
                                #{imei}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 👇 use corrected variables */}
                      <td className="text-center p-2">
                        {unitPrice.toLocaleString()}
                      </td>
                      <td className="text-center p-2">{qty}</td>
                      <td className="text-center p-2 font-medium text-gray-700">
                        {total.toLocaleString()} BDT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={proceed}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
