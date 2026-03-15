"use client";

import { React, useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Upload } from "lucide-react";
import { useGetAttributeListQuery } from "@/app/store/api/attributesApi";
import { imageUpload } from "@/app/store/imageSlice";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

// Static field definitions
const productFields = [
  // { key: "sku", label: "SKU", type: "text", placeholder: "Enter SKU" },
  {
    key: "barcode",
    label: "Barcode",
    type: "text",
    placeholder: "Enter Barcode",
  },
  {
    key: "sell_price",
    label: "Sell Price",
    type: "number",
    placeholder: "0.00",
  },
  {
    key: "purchase_price",
    label: "Purchase Price",
    type: "number",
    placeholder: "0.00",
  },
  // { key: "quantity", label: "Quantity", type: "number", placeholder: "0" },
  { key: "discount", label: "Discount", type: "number", placeholder: "0" },
  // UPDATED: Changed field key to 'images' to match array structure

  {
    key: "discount_type",
    label: "Discount Type",
    type: "select",
    options: [null, "fixed", "percentage"], // null represents no discount type
  },

  {
    key: "discounted_price",
    label: "Discounted Price",
    type: "number",
    placeholder: "0.00",
    readonly: true, // custom property, used to disable editing
  },
  {
    key: "images",
    label: "Images",
    type: "upload",
    placeholder: "Upload images",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["active", "inactive"],
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    placeholder: "Enter description",
  },
];

export default function ProductAttributes({ setValue, form, watch }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // Global state for fields and attributes selected across all product items
  const [globalSelectedFields, setGlobalSelectedFields] = useState([]); // Tracks all selected fields
  const [globalSelectedAttributes, setGlobalSelectedAttributes] = useState([]); // Tracks all selected attributes

  // UI state for image handling, tracked by item ID
  const [uploadingImages, setUploadingImages] = useState({});
  const fileInputRefs = useRef({});

  const [productItems, setProductItems] = useState([
    {
      id: 1,
      // sku: "",
      barcode: "",
      sell_price: 0,
      purchase_price: 0,
      // quantity: 0,
      // UPDATED: Changed to an array for multiple images
      images: [],
      discount: 0,
      discount_type: null,
      discounted_price: 0,
      description: "",
      status: "active",
      attributes: [],
      selectedFields: [], // fields chosen for this product item
      selectedAttributes: [], // attributes chosen for this product item
    },
  ]);

  // Fetch attributes from API
  const { data: attributesData, isLoading: attributesLoading } =
    useGetAttributeListQuery();

  // Function to prepare the payload by removing UI-only fields
  const preparePayload = (items) => {
    return items.map((item) => {
      // Destructure to exclude id, selectedFields, and selectedAttributes
      const { id, selectedFields, selectedAttributes, ...payloadItem } = item;
      return payloadItem;
    });
  };

  // --- UPDATED: Image handling for multiple images (array) ---
  const handleImageUpload = async (itemId, file) => {
    if (!file || !session?.accessToken) return;

    const uploadKey = `${itemId}`;
    setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const uploadResult = await dispatch(
        imageUpload({
          image: file,
          token: session.accessToken,
        })
      ).unwrap();

      // Update the product item with the new image URL added to the array
      setProductItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          if (item.id === itemId) {
            // Add the new image URL to the existing images array
            const newImages = [...(item.images || []), uploadResult];
            const updatedItem = { ...item, images: newImages };

            // Update the form value here to ensure the payload is fresh
            const payload = preparePayload(
              prevItems.map((p) => (p.id === itemId ? updatedItem : p))
            );
            setValue("product_items", payload, { shouldValidate: true });

            return updatedItem;
          }
          return item;
        });
        return updatedItems;
      });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeImage = (itemId, imageUrl) => {
    setProductItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === itemId) {
          // Filter out the image URL to be removed
          const newImages = (item.images || []).filter(
            (url) => url !== imageUrl
          );
          const updatedItem = { ...item, images: newImages };

          // Update the form value here to ensure the payload is fresh
          const payload = preparePayload(
            prevItems.map((p) => (p.id === itemId ? updatedItem : p))
          );
          setValue("product_items", payload, { shouldValidate: true });

          return updatedItem;
        }
        return item;
      });
      return updatedItems;
    });
  };
  // --- END UPDATED Image handling ---

  // --- Overhauled this effect to properly handle edit mode ---
  // Initialize product items and global state from form on mount only
  useEffect(() => {
    // Using a short timeout to ensure the form values are populated
    const timer = setTimeout(() => {
      const getProductItems = watch("product_items");

      // Check if there are existing product items (i.e., we are in "edit" mode)
      if (getProductItems && getProductItems.length > 0) {
        // --- Logic to determine the global state from ALL existing items ---
        const allUsedFields = new Set();
        const allUsedAttributeIds = new Set();

        getProductItems.forEach((item) => {
          // Check which regular fields have values
          productFields.forEach((field) => {
            // A field is considered "used" if it has a non-default/non-empty value.
            const value = item[field.key];
            const isDefaultZero = field.type === "number" && value === 0;
            const isDefaultStatus =
              field.key === "status" && value === "active";
            const isDefaultImage =
              field.key === "images" &&
              Array.isArray(value) &&
              value.length === 0;

            if (
              value !== undefined &&
              value !== null &&
              value !== "" &&
              !isDefaultZero &&
              !isDefaultImage
            ) {
              allUsedFields.add(field.key);
            }
            // Status field is often included by default, so we'll ensure it's added if it exists.
            if (field.key === "status" && value) {
              allUsedFields.add(field.key);
            }
          });
          // Check which attributes are used
          if (Array.isArray(item.attributes)) {
            item.attributes.forEach((attr) => {
              if (attr.attribute_id) {
                allUsedAttributeIds.add(attr.attribute_id);
              }
            });
          }
        });

        const newGlobalSelectedFields = Array.from(allUsedFields);
        const newGlobalSelectedAttributes = Array.from(allUsedAttributeIds);

        // --- Hydrate items with UI-specific state ---
        const itemsWithUiState = getProductItems.map((item, index) => ({
          ...item,
          id: index + 1, // Assign a temporary unique ID for the UI
          // Set the selections for this item to match the new global state
          selectedFields: newGlobalSelectedFields,
          selectedAttributes: newGlobalSelectedAttributes,
        }));

        // --- Set all states at once ---
        setProductItems(itemsWithUiState);
        setGlobalSelectedFields(newGlobalSelectedFields);
        setGlobalSelectedAttributes(newGlobalSelectedAttributes);
      }
    }, 100); // A small delay can help ensure form state is ready.

    return () => clearTimeout(timer); // Cleanup the timeout
  }, []); // This effect should run only once on mount.
  // --- END Initial state effect ---

  const addProductItem = () => {
    const newId =
      productItems.length > 0
        ? Math.max(...productItems.map((item) => item.id)) + 1
        : 1;
    const newProductItems = [
      ...productItems,
      {
        id: newId,
        // sku: "",
        barcode: "",
        sell_price: 0,
        purchase_price: 0,
        // quantity: 0,
        images: [], // UPDATED: Changed to array
        discount: 0,
        description: "",
        status: "active",
        attributes: [],
        // Default to globally selected fields and attributes
        selectedFields: [...globalSelectedFields],
        selectedAttributes: [...globalSelectedAttributes],
      },
    ];
    setProductItems(newProductItems);

    // Use preparePayload to clean the array before setting the form value
    const payload = preparePayload(newProductItems);
    setValue("product_items", payload, { shouldValidate: true });
  };

  const removeProductItem = (id) => {
    if (productItems.length > 1) {
      const uploadKey = `${id}`;
      // Note: No need to clean up image previews here as they are part of the component state
      // but cleaning refs is still good practice.
      delete fileInputRefs.current[uploadKey];

      const newProductItems = productItems.filter((item) => item.id !== id);
      setProductItems(newProductItems);

      // Use preparePayload to clean the array before setting the form value
      const payload = preparePayload(newProductItems);
      setValue("product_items", payload, { shouldValidate: true });
    }
  };

  // const updateProductItem = (id, field, value) => {
  //   const updatedProductItems = productItems.map((item) =>
  //     item.id === id ? { ...item, [field]: value } : item
  //   );
  //   setProductItems(updatedProductItems);

  //   // Use preparePayload to clean the array before setting the form value
  //   const payload = preparePayload(updatedProductItems);
  //   setValue("product_items", payload, { shouldValidate: true });
  // };

  const updateProductItem = (id, field, value) => {
    const updatedProductItems = productItems.map((item) => {
      if (item.id !== id) return item;

      const updatedItem = { ...item, [field]: value };

      // --- Discount logic ---
      const { sell_price, discount, discount_type } = updatedItem;

      if (discount_type === "fixed") {
        updatedItem.discounted_price = Math.max(sell_price - discount, 0);
      } else if (discount_type === "percentage") {
        const discountValue = (sell_price * discount) / 100;
        updatedItem.discounted_price = Math.max(sell_price - discountValue, 0);
      } else {
        // discount_type null — no discount applied
        updatedItem.discounted_price = sell_price;
      }
      // --- End discount logic ---

      return updatedItem;
    });

    setProductItems(updatedProductItems);

    const payload = preparePayload(updatedProductItems);
    setValue("product_items", payload, { shouldValidate: true });
  };

  const updateProductItemAttribute = (
    itemId,
    attributeId,
    attributeValueId
  ) => {
    const updatedProductItems = productItems.map((item) => {
      if (item.id === itemId) {
        const existingAttributes = item.attributes || [];
        const existingAttributeIndex = existingAttributes.findIndex(
          (attr) => attr.attribute_id === attributeId
        );

        let newAttributes;
        if (existingAttributeIndex >= 0) {
          // Update existing attribute
          newAttributes = existingAttributes.map((attr, index) =>
            index === existingAttributeIndex
              ? {
                  attribute_id: attributeId,
                  attribute_value_id: attributeValueId,
                }
              : attr
          );
        } else {
          // Add new attribute
          newAttributes = [
            ...existingAttributes,
            { attribute_id: attributeId, attribute_value_id: attributeValueId },
          ];
        }

        return { ...item, attributes: newAttributes };
      }
      return item;
    });

    setProductItems(updatedProductItems);
    // Use preparePayload to clean the array before setting the form value
    const payload = preparePayload(updatedProductItems);
    setValue("product_items", payload, { shouldValidate: true });
  };

  const getSelectedAttributeValue = (itemId, attributeId) => {
    const item = productItems.find((item) => item.id === itemId);
    if (!item || !item.attributes) return "";

    const attribute = item.attributes.find(
      (attr) => attr.attribute_id === attributeId
    );
    return attribute ? attribute.attribute_value_id : "";
  };

  // toggle field selection, applying to all items and setting global state
  const toggleFieldSelection = (itemId, fieldKey) => {
    const currentItem = productItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    const alreadySelected = currentItem.selectedFields.includes(fieldKey);
    let newGlobalSelectedFields;

    if (alreadySelected) {
      // Deselect field: remove from global state
      newGlobalSelectedFields = globalSelectedFields.filter(
        (f) => f !== fieldKey
      );
    } else {
      // Select field: add to global state if not already present
      newGlobalSelectedFields = globalSelectedFields.includes(fieldKey)
        ? [...globalSelectedFields]
        : [...globalSelectedFields, fieldKey];
    }

    setGlobalSelectedFields(newGlobalSelectedFields);

    // Apply the change to ALL product items
    const updatedProductItems = productItems.map((item) => ({
      ...item,
      selectedFields: newGlobalSelectedFields,
    }));

    setProductItems(updatedProductItems);

    // Use preparePayload to clean the array before setting the form value
    const payload = preparePayload(updatedProductItems);
    setValue("product_items", payload, { shouldValidate: true });
  };

  // toggle attribute selection, applying to all items and setting global state
  const toggleAttributeSelection = (itemId, attributeId) => {
    const currentItem = productItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    const alreadySelected =
      currentItem.selectedAttributes.includes(attributeId);
    let newGlobalSelectedAttributes;

    if (alreadySelected) {
      // Deselect attribute: remove from global state
      newGlobalSelectedAttributes = globalSelectedAttributes.filter(
        (a) => a !== attributeId
      );
    } else {
      // Select attribute: add to global state if not already present
      newGlobalSelectedAttributes = globalSelectedAttributes.includes(
        attributeId
      )
        ? [...globalSelectedAttributes]
        : [...globalSelectedAttributes, attributeId];
    }

    setGlobalSelectedAttributes(newGlobalSelectedAttributes);

    // Apply the change to ALL product items
    const updatedProductItems = productItems.map((item) => {
      let newAttributes = item.attributes || [];

      // If the attribute is deselected, also remove its value from the attributes array
      if (alreadySelected) {
        newAttributes = newAttributes.filter(
          (attr) => attr.attribute_id !== attributeId
        );
      }

      return {
        ...item,
        selectedAttributes: newGlobalSelectedAttributes,
        attributes: newAttributes,
      };
    });

    setProductItems(updatedProductItems);
    // Use preparePayload to clean the array before setting the form value
    const payload = preparePayload(updatedProductItems);
    setValue("product_items", payload, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {productItems.map((item, index) => (
        <div
          key={item.id}
          // UPDATED: Added subtle shadow and border-t for visual lift
          className="border border-gray-200 rounded-xl shadow-md overflow-hidden bg-white dark:bg-gray-800"
        >
          {/* Item Header */}
          <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 px-5 py-3 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Item {index + 1}
            </h4>
            <Button
              type="button"
              variant="destructive"
              size="icon" // changed to icon size for a cleaner look
              onClick={() => removeProductItem(item.id)}
              disabled={productItems.length === 1}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 space-y-6">
            {/* Field Selection (uses global state for button variant) */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose Fields
              </Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {productFields.map((field) => (
                  <Button
                    key={field.key}
                    type="button"
                    size="sm"
                    // UPDATED: Use 'default' (solid) for selected, 'secondary' (light) for unselected
                    variant={
                      globalSelectedFields.includes(field.key)
                        ? "default"
                        : "secondary"
                    }
                    // Pass the current item's ID to the toggle function
                    onClick={() => toggleFieldSelection(item.id, field.key)}
                    className={
                      globalSelectedFields.includes(field.key)
                        ? ""
                        : "text-gray-700 dark:text-gray-200"
                    }
                  >
                    {field.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Render Selected Fields (now uses item.selectedFields, which is synced to global) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {item.selectedFields.map((fieldKey) => {
                const field = productFields.find((f) => f.key === fieldKey);
                if (!field) return null;

                if (field.type === "select") {
                  return (
                    // UPDATED: Added col-span-1 for consistent grid behavior
                    <div key={field.key} className="relative col-span-1">
                      <Label className="text-xs font-semibold text-gray-700 absolute -top-1 left-2 px-1 bg-white dark:bg-gray-800 text-primary dark:text-gray-300 z-10">
                        {field.label}
                      </Label>
                      <Select
                        value={item[field.key]}
                        onValueChange={(value) =>
                          updateProductItem(item.id, field.key, value)
                        }
                      >
                        <SelectTrigger className="mt-1 capitalize">
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem
                              className="capitalize"
                              key={opt}
                              value={opt}
                            >
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                // --- UPDATED: Image Upload/Preview Block for 'images' array ---
                if (field.type === "upload" && field.key === "images") {
                  const uploadKey = `${item.id}`;
                  const isUploading = uploadingImages[uploadKey];
                  const uploadedImages = item.images || [];

                  return (
                    // UPDATED: Added col-span-full for full-width layout
                    <div key={field.key} className="relative col-span-full">
                      <Label className="text-xs font-semibold text-gray-700 absolute -top-1 left-2 px-1 bg-white dark:bg-gray-800 text-primary dark:text-gray-300 z-10">
                        {field.label}
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mt-1 space-y-4">
                        {/* Image Previews */}
                        {uploadedImages.length > 0 && (
                          <div className="flex flex-wrap gap-3 justify-center">
                            {uploadedImages.map((imageUrl, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative w-24 h-24 group" // slightly larger preview
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Product image ${imgIndex + 1}`}
                                  className="w-full h-full object-cover rounded-md border border-gray-200"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-[-5px] right-[-5px] h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md z-20"
                                  onClick={() => removeImage(item.id, imageUrl)}
                                  disabled={isUploading}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload Button */}
                        <div className="space-y-2">
                          <Upload className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Drag and drop or click to upload
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fileInputRefs.current[uploadKey]?.click()
                            }
                            disabled={isUploading}
                          >
                            {isUploading
                              ? "Uploading..."
                              : `Select ${
                                  uploadedImages.length > 0 ? "More" : "Images"
                                }`}
                          </Button>
                        </div>

                        {/* Hidden Input */}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[uploadKey] = el)}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(item.id, file);
                            // Reset the input value so the same file can be selected again
                            e.target.value = null;
                          }}
                        />
                      </div>
                    </div>
                  );
                }
                // --- END UPDATED Image Upload/Preview Block ---

                return (
                  <div key={field.key} className="relative col-span-1">
                    <Label className="text-xs font-semibold text-gray-700 absolute -top-1 left-2 px-1 bg-white dark:bg-gray-800 text-primary dark:text-gray-300 z-10">
                      {field.label}
                    </Label>
                    {/* <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      // Ensure value handles numbers/floats correctly
                      value={
                        item[field.key] !== undefined &&
                        item[field.key] !== null
                          ? item[field.key]
                          : ""
                      }
                      onChange={(e) =>
                        updateProductItem(
                          item.id,
                          field.key,
                          field.type === "number"
                            ? Number.parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      className="mt-1"
                    /> */}

                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={
                        item[field.key] !== undefined &&
                        item[field.key] !== null
                          ? item[field.key]
                          : ""
                      }
                      onChange={(e) =>
                        updateProductItem(
                          item.id,
                          field.key,
                          field.type === "number"
                            ? Number.parseFloat(e.target.value) || 0
                            : e.target.value
                        )
                      }
                      className="mt-1"
                      disabled={field.readonly}
                    />
                  </div>
                );
              })}
            </div>

            {/* Attribute Selection (uses global state for button variant) */}
            <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-700">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Choose Attributes
                <Link href="/settings/attributes" passHref legacyBehavior>
                  <Button
                    as="a"
                    variant="outline"
                    size="xs" // Custom size for smaller button
                    className="text-[10px] font-semibold px-2 h-6 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 ml-3 transition-colors"
                  >
                    Manage Attributes
                  </Button>
                </Link>
              </Label>
              {attributesLoading ? (
                <div className="text-sm text-gray-500">
                  Loading attributes...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attributesData?.map((attr) => (
                    <Button
                      key={attr.id}
                      type="button"
                      size="sm"
                      // UPDATED: Use 'default' (solid) for selected, 'secondary' (light) for unselected
                      variant={
                        globalSelectedAttributes.includes(attr.id)
                          ? "default"
                          : "secondary"
                      }
                      // Pass the current item's ID to the toggle function
                      onClick={() => toggleAttributeSelection(item.id, attr.id)}
                      className={
                        globalSelectedAttributes.includes(attr.id)
                          ? ""
                          : "text-gray-700 dark:text-gray-200"
                      }
                    >
                      {attr.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Render Selected Attributes (now uses item.selectedAttributes, which is synced to global) */}
            {item.selectedAttributes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                {item.selectedAttributes.map((attrId) => {
                  const attribute = attributesData?.find(
                    (a) => a.id === attrId
                  );
                  if (!attribute) return null;

                  return (
                    <div key={attribute.id} className="relative col-span-1">
                      <Label className="text-xs font-semibold text-gray-700 absolute -top-1 left-2 px-1 bg-white dark:bg-gray-800 text-primary dark:text-gray-300 z-10">
                        {attribute.name}
                      </Label>
                      <Select
                        value={
                          getSelectedAttributeValue(
                            item.id,
                            attribute.id
                          )?.toString() || ""
                        }
                        onValueChange={(value) =>
                          updateProductItemAttribute(
                            item.id,
                            attribute.id,
                            Number.parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue
                            placeholder={`Select ${attribute.name}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {attribute.values?.map((value) => (
                            <SelectItem
                              key={value.id}
                              value={value.id.toString()}
                            >
                              {value.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Button */}
      <div className="flex justify-start pt-2">
        <Button
          type="button"
          onClick={addProductItem}
          // UPDATED: Use a more standard primary color for the action button
          className="bg-primary hover:bg-primary/90 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product Item
        </Button>
      </div>
    </div>
  );
}
