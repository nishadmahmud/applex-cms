"use client";
import { React, useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useSaveBundleMutation,
  useUpdateBundleMutation,
} from "@/app/store/api/bundlesApi";
import useProduct from "@/apiHooks/hooks/useProduct";
import dynamic from "next/dynamic";

const AsyncSelect = dynamic(() => import("react-select"), { ssr: false });

export default function BundleForm({
  isOpen,
  onClose,
  onSuccess,
  editingBundle,
}) {
  const [saveBundle, { isLoading: isSaving }] = useSaveBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] = useUpdateBundleMutation();
  const { data: products, searchProducts } = useProduct();
  const debounceRef = useRef(null);
  const [keyword, setKeyword] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: true,
    items: [],
  });

  const isLoading = isSaving || isUpdating;
  const isEditing = !!editingBundle;

  // Reset form when modal opens/closes or editing bundle changes
  useEffect(() => {
    if (isOpen) {
      if (editingBundle) {
        setFormData({
          id: editingBundle.id,
          title: editingBundle.title || "",
          description: editingBundle.description || "",
          status: editingBundle.status === 1,
          items:
            editingBundle.items?.map((item) => {
              if (item.product_item_id) {
                // Product item (variant)
                return {
                  id: item.id,
                  product_item_id: item.product_item_id,
                  item_name: `${
                    item.product_item?.product?.name
                  } - ${item.product_item?.attributes
                    ?.map((attr) => attr.attribute_value?.value)
                    .join(", ")}`,
                  item_sku: item.product_item?.sku,
                  discount_type: item.discount_type,
                  discount_value: Number.parseFloat(item.discount_value),
                };
              } else {
                // Regular product
                return {
                  id: item.id,
                  product_id: item.product_id,
                  item_name: item.product?.name,
                  item_sku: item.product?.sku,
                  discount_type: item.discount_type,
                  discount_value: Number.parseFloat(item.discount_value),
                };
              }
            }) || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          status: true,
          items: [],
        });
      }
      setKeyword("");
    }
  }, [isOpen, editingBundle]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchInput = (value) => {
    setKeyword(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (value) {
        await searchProducts.mutateAsync(value);
      }
    }, 600);
  };

  const handleAddProduct = (selectedOption) => {
    if (!selectedOption) return;

    const isDuplicate = formData.items.some((item) => {
      if (selectedOption.type === "product_item") {
        return item.product_item_id === selectedOption.value;
      } else {
        return item.product_id === selectedOption.value;
      }
    });

    if (isDuplicate) {
      toast.warning("This item is already added to the bundle");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        selectedOption.type === "product_item"
          ? {
              product_item_id: selectedOption.value,
              item_name: selectedOption.label,
              item_sku: selectedOption.sku,
              discount_type: "percentage",
              discount_value: 0,
            }
          : {
              product_id: selectedOption.value,
              item_name: selectedOption.label,
              item_sku: selectedOption.sku,
              discount_type: "percentage",
              discount_value: 0,
            },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Bundle title is required");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("At least one product is required");
      return;
    }

    // Validate discount values
    for (const item of formData.items) {
      if (!item.discount_value || item.discount_value <= 0) {
        toast.error("All products must have a valid discount value");
        return;
      }
    }

    try {
      if (isEditing) {
        const payload = {
          id: formData.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status,
          items: formData.items.map((item) => {
            const itemData = {
              discount_type: item.discount_type,
              discount_value: item.discount_value,
            };

            // If item has an id, it's an existing item
            if (item.id) {
              itemData.id = item.id;
            } else {
              // New item needs product_id or product_item_id
              if (item.product_item_id) {
                itemData.product_item_id = item.product_item_id;
              } else {
                itemData.product_id = item.product_id;
              }
            }

            return itemData;
          }),
        };

        await updateBundle(payload).unwrap();
        toast.success("Bundle updated successfully");
      } else {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status,
          items: formData.items.map((item) => {
            const itemData = {
              discount_type: item.discount_type,
              discount_value: item.discount_value,
            };

            if (item.product_item_id) {
              itemData.product_item_id = item.product_item_id;
            } else {
              itemData.product_id = item.product_id;
            }

            return itemData;
          }),
        };

        await saveBundle(payload).unwrap();
        toast.success("Bundle created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} bundle`
      );
    }
  };

  const mapProductToOption = (item) => ({
    value: item.id,
    label: item.name,
    sku: item.sku,
    image:
      Array.isArray(item.image_paths) && item.image_paths.length > 0
        ? item.image_paths[0]
        : null,
    type: "product", // Mark as product
  });

  const mapProductItemToOption = (item, parentProduct) => {
    // Build label with product name and attributes
    const attributeLabels =
      item.attributes?.map((attr) => attr.attribute_value?.value).join(", ") ||
      "";
    const label = `${parentProduct.name}${
      attributeLabels ? ` - ${attributeLabels}` : ""
    }`;

    return {
      value: item.id,
      label: label,
      sku: item.sku,
      image:
        Array.isArray(item.images) && item.images.length > 0
          ? item.images[0]
          : null,
      type: "product_item", // Mark as product item
      parentName: parentProduct.name,
      attributes: attributeLabels,
    };
  };

  const productOptions = [];

  const sourceData =
    keyword && searchProducts?.data
      ? searchProducts?.data?.data?.data
      : products?.data && products?.data?.data?.data?.length
      ? products?.data?.data?.data
      : [];

  sourceData.forEach((product) => {
    // Add the product itself
    productOptions.push(mapProductToOption(product));

    // Add product items (variants) if they exist
    if (product.items && product.items.length > 0) {
      product.items.forEach((item) => {
        productOptions.push(mapProductItemToOption(item, product));
      });
    }
  });

  const CustomOption = ({
    label,
    sku,
    image,
    type,
    parentName,
    attributes,
  }) => (
    <div className="flex items-center gap-3">
      {/* Render Image */}
      {image ? (
        <img
          src={image || "/placeholder.svg"}
          alt={label}
          className="w-8 h-8 object-cover rounded-sm flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
          No Img
        </div>
      )}

      {/* Render Name and SKU */}
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium truncate">
          {label}
          {type === "product_item" && (
            <span className="ml-1 text-xs text-blue-600">(Variant)</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          SKU: {sku || "N/A"}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Bundle" : "Add New Bundle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bundle Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Bundle Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Office Pack, Gaming Bundle"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter bundle description (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status ? "active" : "inactive"}
              onValueChange={(value) =>
                handleInputChange("status", value === "active")
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Products */}
          <div className="space-y-4">
            <Label>Bundle Products *</Label>

            {/* Product search and add */}
            <div className="space-y-2">
              <AsyncSelect
                onInputChange={handleSearchInput}
                options={productOptions}
                isLoading={searchProducts?.isPending}
                onChange={handleAddProduct}
                placeholder="Search and select products or variants..."
                isClearable
                value={null}
                isDisabled={isLoading}
                formatOptionLabel={(option) => (
                  <CustomOption
                    label={option.label}
                    sku={option.sku}
                    image={option.image}
                    type={option.type}
                    parentName={option.parentName}
                    attributes={option.attributes}
                  />
                )}
              />
            </div>

            {/* Products list */}
            {formData.items.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Products ({formData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Badge variant="outline" className="text-xs">
                            {item.item_name}
                            {item.product_item_id && (
                              <span className="ml-1 text-blue-600">
                                (Variant)
                              </span>
                            )}
                          </Badge>
                          {item.item_sku && (
                            <span className="text-xs text-muted-foreground">
                              SKU: {item.item_sku}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Discount Type</Label>
                          <Select
                            value={item.discount_type}
                            onValueChange={(value) =>
                              handleUpdateItem(index, "discount_type", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage (%)
                              </SelectItem>
                              <SelectItem value="amount">
                                Fixed Amount (৳)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">
                            Discount Value{" "}
                            {item.discount_type === "percentage"
                              ? "(%)"
                              : "(৳)"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount_value}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "discount_value",
                                Number.parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                            disabled={isLoading}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No products added yet</p>
                <p className="text-sm">
                  Search and add at least one product to continue
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.title.trim() ||
                formData.items.length === 0
              }
            >
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Bundle"
                : "Create Bundle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
