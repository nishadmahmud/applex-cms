"use client";
import { React, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import useProduct from "@/apiHooks/hooks/useProduct";
import { useSaveNewCustomerDiscountMutation } from "@/app/store/api/newCustomerDiscountApi";

const AsyncSelect = dynamic(() => import("react-select"), { ssr: false });

export default function NewCustomerDiscountForm({
  isOpen,
  onClose,
  onSuccess,
  editingDiscount,
}) {
  const [saveDiscount, { isLoading }] = useSaveNewCustomerDiscountMutation();
  const { data: products, searchProducts } = useProduct();
  const [formData, setFormData] = useState({
    name: "",
    discount_type: "percentage",
    discount_amount: 0,
    items: [],
  });

  const debounceRef = useRef(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingDiscount) {
        setFormData({
          name: editingDiscount.name || "",
          discount_type: editingDiscount.discount_type,
          discount_amount: parseFloat(editingDiscount.discount_amount),
          items:
            editingDiscount.products?.map((p) => {
              const isVariant = !!p.pivot?.product_item_id;
              return isVariant
                ? {
                    product_item_id: p.pivot.product_item_id,
                    product_id: p.id,
                    item_name: `${p.name} - ${
                      p.product_items?.[0]?.attributes
                        ?.map((a) => a.attribute_value?.value)
                        .join(", ") || ""
                    }`,
                    sku: p.product_items?.[0]?.sku,
                    image: p.image_paths?.[0],
                  }
                : {
                    product_id: p.id,
                    item_name: p.name,
                    sku: p.sku,
                    image: p.image_paths?.[0],
                  };
            }) || [],
        });
      } else {
        setFormData({
          name: "",
          discount_type: "percentage",
          discount_amount: 0,
          items: [],
        });
      }
      setKeyword("");
    }
  }, [isOpen, editingDiscount]);

  const handleSearchInput = (v) => {
    setKeyword(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (v) await searchProducts.mutateAsync(v);
    }, 500);
  };

  const sourceData =
    keyword && searchProducts?.data
      ? searchProducts?.data?.data?.data
      : products?.data?.data?.data || [];

  const mapProductToOption = (product) => ({
    value: product.id,
    label: product.name,
    sku: product.sku,
    image: product.image_paths?.[0],
    type: "product",
  });

  const mapProductItemToOption = (item, parent) => {
    const attrLabels =
      item.attributes?.map((a) => a.attribute_value?.value).join(", ") || "";
    return {
      value: item.id,
      label: `${parent.name}${attrLabels ? ` - ${attrLabels}` : ""}`,
      sku: item.sku,
      image: item.images?.[0],
      type: "product_item",
    };
  };

  //   show product variants as well or items in dropdown
  //   const productOptions = [];
  //   sourceData.forEach((p) => {
  //     productOptions.push(mapProductToOption(p));
  //     p.items?.forEach((i) => productOptions.push(mapProductItemToOption(i, p)));
  //   });

  // show only main products, not product variants
  const productOptions = sourceData.map((p) => mapProductToOption(p));

  const addItem = (selected) => {
    if (!selected) return;
    const duplicate = formData.items.some((it) =>
      selected.type === "product_item"
        ? it.product_item_id === selected.value
        : it.product_id === selected.value
    );
    if (duplicate) return toast.warning("Already added.");

    const newItem =
      selected.type === "product_item"
        ? {
            product_item_id: selected.value,
            item_name: selected.label,
            sku: selected.sku,
            image: selected.image,
          }
        : {
            product_id: selected.value,
            item_name: selected.label,
            sku: selected.sku,
            image: selected.image,
          };
    setFormData((p) => ({ ...p, items: [...p.items, newItem] }));
  };

  const removeItem = (index) =>
    setFormData((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name required");
    if (formData.items.length === 0)
      return toast.error("Select at least one product");

    const payload = {
      name: formData.name.trim(),
      discount_type: formData.discount_type,
      discount_amount: formData.discount_amount,
      product_ids: formData.items
        .filter((i) => i.product_id)
        .map((i) => i.product_id),
      product_item_ids: formData.items
        .filter((i) => i.product_item_id)
        .map((i) => i.product_item_id),
    };

    try {
      await saveDiscount(payload).unwrap();
      toast.success("Discount saved successfully");
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save");
    }
  };

  const CustomOption = ({ label, sku, image, type }) => (
    <div className="flex items-center gap-3">
      {image ? (
        <img src={image} alt={label} className="w-8 h-8 rounded object-cover" />
      ) : (
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-muted-foreground">
          No Img
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          SKU: {sku || "N/A"}{" "}
          {type === "product_item" && (
            <span className="text-blue-600">(Variant)</span>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDiscount ? "Update Discount" : "Create Discount"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Welcome Discount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(v) =>
                  setFormData({ ...formData, discount_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Products *</Label>
            <AsyncSelect
              onInputChange={handleSearchInput}
              options={productOptions}
              onChange={addItem}
              isClearable
              placeholder="Search products..."
              formatOptionLabel={(o) => <CustomOption {...o} />}
              isLoading={searchProducts?.isPending}
              value={null}
            />
          </div>

          {formData.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Selected Products ({formData.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border rounded p-2"
                  >
                    <div className="flex gap-2 items-center">
                      <img
                        src={it.image || "/placeholder.svg"}
                        className="w-8 h-8 rounded object-cover"
                        alt=""
                      />
                      <div>
                        <p className="font-medium text-sm">{it.item_name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {it.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(idx)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingDiscount
                ? "Update Discount"
                : "Create Discount"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
