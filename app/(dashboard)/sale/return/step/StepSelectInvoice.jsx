"use client";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  useGetProductsQuery,
  useSearchProductsMutation,
} from "@/app/store/api/salesReturnApi";
import {
  useGetInvoiceByConsignmentIdMutation,
  useGetInvoiceByImeiMutation,
} from "@/app/store/api/salesReturnCreationApi";

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
  const [getInvoiceByCid] = useGetInvoiceByConsignmentIdMutation();
  const [consignmentId, setConsignmentId] = useState("");

  const [getInvoiceByImei] = useGetInvoiceByImeiMutation();
  const [imei, setImei] = useState("");

  const [searchProducts] = useSearchProductsMutation();
  const { data: initProducts } = useGetProductsQuery({ page: 1, limit: 20 });

  const allProducts =
    productKeyword.trim().length > 0
      ? undefined
      : initProducts?.data?.data || [];

  const styles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 8,
      backgroundColor: "#fafafa",
      borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
      boxShadow: "none",
      "&:hover": { borderColor: "#2563eb" },
    }),
    menu: (base) => ({ ...base, zIndex: 55 }),
  };

  useEffect(() => {
    if (invoices?.length) {
      const base = invoices.map((inv) => ({
        value: inv.invoice_id,
        label: inv.invoice_id,
        data: inv,
      }));
      setInvoiceOptions(base);
    }
  }, [invoices]);

  const productSearchTimer = useRef();
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
            })),
          );
        })
        .catch(() => {});
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
    setSelectedProducts([]);
    setSelectAll(false);

    if (product) {
      try {
        const res = await searchInvoice({
          keyword: "",
          product_id: product.id,
        }).unwrap();
        const invList =
          res?.data?.data?.map((v) => ({
            value: v.invoice_id,
            label: v.invoice_id,
            data: v,
          })) || [];
        setInvoiceOptions(invList);
      } catch (err) {
        console.error("Invoice filtering failed", err);
      }
    } else {
      const base = invoices.map((inv) => ({
        value: inv.invoice_id,
        label: inv.invoice_id,
        data: inv,
      }));
      setInvoiceOptions(base);
    }
  };

  const toggleProductSelect = (item) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item],
    );
  };

  const toggleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedProducts(checked ? selectedInvoice?.sales_details || [] : []);
  };

  const invoiceSearchTimer = useRef();
  const handleInvoiceInput = (input, meta) => {
    if (meta.action !== "input-change") return;
    clearTimeout(invoiceSearchTimer.current);
    invoiceSearchTimer.current = setTimeout(async () => {
      try {
        const res = await searchInvoice({
          keyword: input,
          product_id: selectedProduct?.id || null,
        }).unwrap();
        const invs =
          res?.data?.data?.map((v) => ({
            value: v.invoice_id,
            label: v.invoice_id,
            data: v,
          })) || [];
        setInvoiceOptions(invs);
      } catch (e) {
        console.error("Invoice search failed", e);
      }
    }, 500);
  };

  // === Proceed to next step ===
  const proceed = () => {
    if (!selectedInvoice || !selectedProducts.length) {
      toast.warning("Select invoice and at least one product.");
      return;
    }

    const mapped = selectedProducts.map((p) => {
      // Default to invoice quantity and correct per‑unit price
      const qty = Number(p.remaining_qty || 1);
      const unitPrice = Number(p.price || p.product_info?.retails_price || 0);

      return {
        id: p.id,
        product_id: p.product_id,
        details_id: p.id,
        product_item_id: p.product_item_id || null,
        imei:
          p.product_info?.have_variant && p.product_imei?.length
            ? p.product_imei[0]?.imei
            : null,
        is_variant: Boolean(p.product_info?.have_variant),
        // Return qty defaults to sold qty (but editable later)
        product_variant_id: p.product_variant_id || null,
        child_product_variant_id: p.child_product_variant_id || null,
        return_qty: qty,
        purchase_qty: p.qty,
        return_unit_price: unitPrice,
        price: unitPrice,
        // initial total – will be updated if qty changes
        return_amount: unitPrice * qty,
        discount_type: "Fixed",
        discount: 0,
        return_stock_status: 1,
      };
    });

    onNext(mapped);
  };

  // === Render ===
  return (
    <div className="space-y-6">
      {/* --- Product field --- */}
      {/* --- Product & Consignment fields side by side --- */}
      <div className="grid grid-cols-2 gap-3">
        {/* Product Selection */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">
            Select Product{" "}
            <span className="text-gray-400 font-normal">
              (to filter invoice)
            </span>
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

        {/* Search by Consignment ID */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">
            Search Invoice by Consignment
          </label>
          <div className="flex gap-0">
            <input
              type="text"
              value={consignmentId}
              onChange={(e) => setConsignmentId(e.target.value)}
              placeholder="Enter consignment ID"
              className="flex-1 border border-gray-300 rounded-l-md rounded-r-none px-3 py-2 bg-[#fafafa] text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={async () => {
                if (!consignmentId.trim()) {
                  toast.warning("Enter consignment ID first.");
                  return;
                }
                try {
                  const res = await getInvoiceByCid({
                    consignment_id: consignmentId.trim(),
                  }).unwrap();

                  const invoiceArray = res?.data || [];

                  if (!Array.isArray(invoiceArray) || !invoiceArray.length) {
                    toast.error("No invoice found for this consignment ID.");
                    return;
                  }

                  // take the first invoice object (or map all if user can choose)
                  const found = invoiceArray[0];
                  const invOpt = {
                    value: found.invoice_id,
                    label: found.invoice_id,
                    data: found,
                  };

                  // populate invoice select options
                  setInvoiceOptions([invOpt]);

                  // set selected invoice in dropdown
                  setSelectedInvoice(found);

                  // reset product selection
                  setSelectedProducts([]);
                  setSelectAll(false);

                  toast.success("Invoice loaded successfully!");
                } catch (err) {
                  console.error("Consignment search failed", err);
                  toast.error("Failed to load invoice by consignment ID.");
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-l-none rounded-r-md hover:bg-blue-700 text-sm border border-l-0 border-blue-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* --- Search by IMEI --- */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700">
            Search Invoice by IMEI
          </label>
          <div className="flex gap-0">
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              placeholder="Enter IMEI number"
              className="flex-1 border border-gray-300 rounded-l-md rounded-r-none px-3 py-2 bg-[#fafafa] text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={async () => {
                if (!imei.trim()) {
                  toast.warning("Enter an IMEI number first.");
                  return;
                }
                try {
                  // --- Step 1: Query by IMEI ---
                  const res = await getInvoiceByImei({
                    imei: imei.trim(),
                  }).unwrap();
                  const item = res?.data?.[0];
                  if (!item || !item.sale_invoice_id) {
                    toast.error("No invoice found for this IMEI.");
                    return;
                  }

                  // --- Step 2: Fetch full invoice details with existing searchInvoice ---
                  const invoiceResponse = await searchInvoice({
                    keyword: item.sale_invoice_id,
                  }).unwrap();

                  const invoiceList = invoiceResponse?.data?.data || [];
                  const foundInvoice = invoiceList.find(
                    (inv) => inv.invoice_id === item.sale_invoice_id,
                  );

                  if (!foundInvoice) {
                    toast.error("Full invoice details not found.");
                    return;
                  }

                  // --- Step 3: Update state just like other flows ---
                  const invOpt = {
                    value: foundInvoice.invoice_id,
                    label: foundInvoice.invoice_id,
                    data: foundInvoice,
                  };
                  setInvoiceOptions([invOpt]);
                  setSelectedInvoice(foundInvoice);
                  setSelectedProducts([]);
                  setSelectAll(false);

                  toast.success("Invoice loaded successfully via IMEI!");
                } catch (err) {
                  console.error("IMEI search failed", err);
                  toast.error("Failed to load invoice by IMEI.");
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-l-none rounded-r-md hover:bg-blue-700 text-sm border border-l-0 border-blue-600"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* --- Invoice field --- */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-700">
          Select Invoice
        </label>
        <Select
          styles={styles}
          placeholder="Search or select invoice"
          options={invoiceOptions}
          onInputChange={handleInvoiceInput}
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
        />
      </div>

      {/* --- Sold Products Table --- */}
      {selectedInvoice && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-800">
              Sold Product List
            </h4>
            <span className="text-xs text-gray-400">
              {new Date(selectedInvoice.created_at).toLocaleString()}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="p-2 text-center">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">Product</th>
                  <th className="p-2 text-center">Unit Price</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.sales_details?.map((item) => {
                  const img =
                    item.product_item?.images?.[0] ||
                    item.product_info?.image_paths?.[0] ||
                    item.product_info?.image_path;

                  const imei = item.product_imei?.length
                    ? item.product_imei[0]?.imei
                    : null;

                  const unitPrice = Number(
                    item.price || item.product_info?.retails_price || 0,
                  );
                  const qty = Number(item.remaining_qty || 1);
                  const total = unitPrice * qty;

                  return (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="text-center">
                        <Checkbox
                          checked={selectedProducts.some(
                            (p) => p.id === item.id,
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
                          <div className="space-y-[2px]">
                            <div className="font-medium text-gray-800">
                              {item.product_info?.name}{" "}
                              {item?.product_variant
                                ? ` (${item.product_variant?.name})`
                                : ""}
                            </div>
                            {imei && (
                              <div className="text-xs flex flex-wrap items-center gap-1">
                                <span className="bg-indigo-50 text-indigo-600 px-1.5 py-[1px] rounded">
                                  Variant Product
                                </span>
                                <span className="text-gray-400">#{imei}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-2">
                        {unitPrice.toFixed(2)}
                      </td>
                      <td className="text-center p-2">{qty}</td>
                      <td className="text-center p-2 font-semibold text-gray-800">
                        {total.toFixed(2)} BDT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Buttons --- */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={proceed}>
          Next
        </Button>
      </div>
    </div>
  );
}
