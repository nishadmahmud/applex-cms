"use client";

import { React, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import DynamicProductSpecifications from "./DynamicProductSpecifications";
import { FormControl, FormField, FormLabel } from "@/components/ui/form";
import ReactSelect from "react-select";
import { useGetVariantGroupsQuery } from "@/app/store/api/variantGroupApi";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function DynamicProductVariants({ setValue, form, watch }) {
  const [variants, setVariants] = useState([
    { id: 1, name: "", price: "0", barcode: "", sku: "" },
  ]);
  const variantsInitializedRef = useRef(false);

  const { data: session } = useSession();

  // --- Get Variant Groups (Color, Size etc) from the API ---
  const { data: variantGroupsData, isLoading: variantGroupsLoading } =
    useGetVariantGroupsQuery();

  const variantGroupOptions =
    variantGroupsData?.map((group) => ({
      value: group.id,
      label: group.name,
    })) || [];

  const formVariants = watch("product_variants");

  // Sync variants from form when form was set externally (edit load or size chart)
  useEffect(() => {
    const getVariants = formVariants;
    if (!getVariants || getVariants.length === 0) return;

    setVariants((prev) => {
      // On first load, always sync from form data (covers edit mode where
      // API returns the same number of variants as the default).
      // After that, only re-sync when the count changes (e.g. size chart).
      if (variantsInitializedRef.current && prev.length === getVariants.length) return prev;
      variantsInitializedRef.current = true;
      const withIds = getVariants.map((v, idx) => ({
        ...v,
        id: v.id ?? idx + 1,
        child_variants: v.child_variants ?? v.child_product_variants ?? [],
      }));
      return withIds;
    });
  }, [formVariants?.length]);

  // Listen for auto-populated variants from size chart selection (add mode)
  useEffect(() => {
    const handleSizeChartVariants = (e) => {
      const autoVariants = e.detail;
      if (Array.isArray(autoVariants) && autoVariants.length > 0) {
        setVariants(autoVariants);
      }
    };
    window.addEventListener("SIZE_CHART_VARIANTS_APPLIED", handleSizeChartVariants);
    return () => window.removeEventListener("SIZE_CHART_VARIANTS_APPLIED", handleSizeChartVariants);
  }, []);

  const addVariant = () => {
    const newId = variants.length
      ? Math.max(...variants.map((v) => v.id)) + 1
      : 1;
    const newVariants = [
      ...variants,
      {
        id: newId,
        name: "",
        price: "0",
        barcode: "",
        sku: "",
        variant_group_id: "", // NEW dropdown field
        image: "", // NEW optional image link field
        child_product_variants: [], // NEW nested array for children
      },
    ];

    setVariants(newVariants);
    const withoutId = newVariants.map(({ id, ...variant }) => variant);
    setValue("product_variants", withoutId, { shouldValidate: true });
  };

  const removeVariant = (id) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((variant) => variant.id !== id);
      setVariants(newVariants);

      const withoutId = newVariants.map(({ id, ...variant }) => variant);
      setValue("product_variants", withoutId, { shouldValidate: true });
    }
  };

  const updateVariant = (id, field, value) => {
    const updatedVariants = variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant,
    );
    setVariants(updatedVariants);
    const withoutId = updatedVariants.map(({ id, ...variants }) => variants);
    setValue("product_variants", withoutId, { shouldValidate: true });
  };

  // 🔹 Upload image and save path to variant.image
  const handleVariantImageUpload = async (variantId, file) => {
    if (!file) return;
    if (!session?.accessToken) {
      toast.error("You must be logged in to upload images.");
      return;
    }

    const formData = new FormData();
    formData.append("file_name", file);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/file-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const uploadedPath = res?.data?.path;
      if (uploadedPath) {
        updateVariant(variantId, "image", uploadedPath);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Image upload failed — invalid response.");
      }
    } catch (error) {
      console.error("Variant Image Upload Error:", error);
      toast.error("Failed to upload image.");
    }
  };

  return (
    <div className="space-y-2">
      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-2">
          <FormField
            name="have_variant"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Checkbox
                  checked={field.value == 1}
                  onCheckedChange={(checked) => {
                    field.onChange(checked ? 1 : 0);
                  }}
                  id="have_variant"
                />
              </FormControl>
            )}
          />
          <FormLabel htmlFor="hasVariations" className="text-sm text-gray-700">
            Have Variant?
          </FormLabel>
        </div>
        <div className="flex items-center space-x-2">
          <FormField
            name="is_specification"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Checkbox
                  id="is_specification"
                  checked={field.value == 1}
                  onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              </FormControl>
            )}
          />
          <Label htmlFor="is_specification" className="text-sm text-gray-700">
            Has Product Specifications?
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <FormField
            name="have_product_variant"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Checkbox
                  id="have_product_variant"
                  checked={field.value == 1}
                  onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              </FormControl>
            )}
          />
          <Label
            htmlFor="have_product_variant"
            className="text-sm text-gray-700"
          >
            Has Product Variant (Clothings)?
          </Label>
        </div>
      </div>

      {/* Product Specifications Section */}
      {watch("is_specification") ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Product Specifications
          </h3>
          <DynamicProductSpecifications watch={watch} setValue={setValue} />
        </div>
      ) : (
        ""
      )}

      {/* Dynamic Variant Rows */}
      {watch("have_product_variant") ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Product Variants
          </h3>
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid grid-cols-12 gap-3 items-center"
            >
              {/* Name Field */}
              <div className="col-span-3">
                <Input
                  placeholder={`Name ${index + 1}`}
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                />
              </div>

              {/* price Field */}
              <div className="col-span-2">
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(variant.id, "price", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                />
              </div>

              {/* Barcode Field */}
              <div className="col-span-3">
                <Input
                  placeholder={`Barcode ${index + 1}`}
                  value={variant.barcode}
                  onChange={(e) =>
                    updateVariant(variant.id, "barcode", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                />
              </div>

              {/* SKU Field */}
              <div className="col-span-3">
                <Input
                  placeholder={`SKU ${index + 1}`}
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variant.id, "sku", e.target.value)
                  }
                  className="rounded-md border-gray-300"
                />
              </div>

              {/* Variant Group Dropdown */}
              <div className="col-span-5">
                <ReactSelect
                  placeholder="Select Variant Group"
                  options={variantGroupOptions}
                  isLoading={variantGroupsLoading}
                  value={
                    variantGroupOptions.find(
                      (opt) => opt.value === variant.variant_group_id,
                    ) || null
                  }
                  onChange={(selected) =>
                    updateVariant(
                      variant.id,
                      "variant_group_id",
                      selected?.value || "",
                    )
                  }
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      borderRadius: "0.5rem",
                    }),
                  }}
                />
              </div>

              {/* Image URL (Optional) */}
              {/* Image Upload (Uses API — /file-upload) */}
              <div className="col-span-3 flex items-center gap-2">
                {variant.image ? (
                  <div className="relative w-16 h-16">
                    <img
                      src={variant.image}
                      alt="Variant"
                      className="w-full h-full object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                      onClick={() => updateVariant(variant.id, "image", "")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`variant-image-${variant.id}`}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleVariantImageUpload(variant.id, file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById(`variant-image-${variant.id}`)
                          .click()
                      }
                    >
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <div className="col-span-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                  disabled={variants.length === 1}
                  className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Child Product Variants (Optional) */}
              {variant.variant_group_id && (
                <div className="col-span-12 border-t mt-2 pt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Child Variants
                  </h4>
                  {variant.child_variants?.map((child, cIndex) => (
                    <div
                      key={cIndex}
                      className="grid grid-cols-12 gap-3 mb-2 items-center"
                    >
                      {/* Child Name */}
                      <div className="col-span-3">
                        <Input
                          placeholder={`Child ${cIndex + 1} Name`}
                          value={child.name}
                          onChange={(e) => {
                            const newChilds = [
                              ...variant.child_variants,
                            ];
                            newChilds[cIndex].name = e.target.value;
                            updateVariant(
                              variant.id,
                              "child_variants",
                              newChilds,
                            );
                          }}
                        />
                      </div>

                      {/* Child Group */}
                      <div className="col-span-3">
                        <ReactSelect
                          placeholder="Group"
                          options={variantGroupOptions}
                          value={
                            variantGroupOptions.find(
                              (opt) => opt.value === child.variant_group_id,
                            ) || null
                          }
                          onChange={(selected) => {
                            const newChilds = [
                              ...variant.child_variants,
                            ];
                            newChilds[cIndex].variant_group_id =
                              selected?.value || "";
                            updateVariant(
                              variant.id,
                              "child_variants",
                              newChilds,
                            );
                          }}
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={child.price || ""}
                          onChange={(e) => {
                            const newChilds = [
                              ...variant.child_variants,
                            ];
                            newChilds[cIndex].price = e.target.value;
                            updateVariant(
                              variant.id,
                              "child_variants",
                              newChilds,
                            );
                          }}
                        />
                      </div>

                      {/* Image URL */}
                      {/* Image Upload */}
                      <div className="col-span-2 flex items-center gap-2">
                        {child.image ? (
                          <div className="relative w-14 h-14">
                            <img
                              src={child.image}
                              alt="Child"
                              className="w-full h-full object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-4 w-4 p-0 rounded-full"
                              onClick={() => {
                                const newChilds = [
                                  ...variant.child_variants,
                                ];
                                newChilds[cIndex].image = "";
                                updateVariant(
                                  variant.id,
                                  "child_variants",
                                  newChilds,
                                );
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id={`child-variant-img-${variant.id}-${cIndex}`}
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  // Reuse same uploader but manually insert into child
                                  const uploadImage = async () => {
                                    const formData = new FormData();
                                    formData.append("file_name", file);
                                    try {
                                      const res = await axios.post(
                                        `${process.env.NEXT_PUBLIC_API}/file-upload`,
                                        formData,
                                        {
                                          headers: {
                                            Authorization: `Bearer ${session.accessToken}`,
                                            "Content-Type":
                                              "multipart/form-data",
                                          },
                                        },
                                      );
                                      const path = res?.data?.path;
                                      if (path) {
                                        const newChilds = [
                                          ...variant.child_variants,
                                        ];
                                        newChilds[cIndex].image = path;
                                        updateVariant(
                                          variant.id,
                                          "child_variants",
                                          newChilds,
                                        );
                                        toast.success("Child image uploaded");
                                      }
                                    } catch (error) {
                                      toast.error(
                                        "Failed to upload child image",
                                      );
                                    }
                                  };
                                  uploadImage();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document
                                  .getElementById(
                                    `child-variant-img-${variant.id}-${cIndex}`,
                                  )
                                  .click()
                              }
                            >
                              Upload Img
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newChilds =
                              variant.child_variants.filter(
                                (_, i) => i !== cIndex,
                              );
                            updateVariant(
                              variant.id,
                              "child_variants",
                              newChilds,
                            );
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() => {
                      const newChilds = [
                        ...(variant.child_variants || []),
                        {
                          name: "",
                          variant_group_id: "",
                          price: "",
                          image: "",
                        },
                      ];
                      updateVariant(
                        variant.id,
                        "child_variants",
                        newChilds,
                      );
                    }}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Child Variant
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Add Button */}
          <div className="flex justify-start">
            <Button
              type="button"
              onClick={addVariant}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
