"use client";
import { React } from "react";
import { useGetBrandsQuery } from "@/app/store/api/brandsApi";
import { useGetBundlesQuery } from "@/app/store/api/bundlesApi";
import { useGetCategoryQuery } from "@/app/store/api/categoryApi";
import { setToken } from "@/app/store/authSlice";
import { Button } from "@/components/ui/button";
import { FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, QrCode } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Nunito } from "next/font/google";
import { useGetSizeChartsQuery } from "@/app/store/api/sizeChartApi";
import { useGetAuthorsQuery } from "@/app/store/api/authorsApi";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "1000"],
});

const EnhancedRichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
});

const AddCategoryForm = dynamic(() => import("./AddCategoryForm"), {
  ssr: false,
});
const AddSubCategoryForm = dynamic(() => import("./AddSubCategoryForm"), {
  ssr: false,
});
const AddChildCategoryForm = dynamic(() => import("./AddChildCategoryForm"), {
  ssr: false,
});
const AddBrandForm = dynamic(() => import("./AddBrandForm"), { ssr: false });
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

export default function GeneralPart({
  errors,
  form,
  product,
  mode,
  imageHandler,
  multipleImageHandler,
}) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const apiToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  // --- Watching category and sub-category selections ---
  const watchCategory = form.watch("category_id");
  const watchSubCategory = form.watch("sub_category_id");

  // --- Core queries ---
  const { data: brands } = useGetBrandsQuery(
    { page: 1, limit: 1000 },
    {
      skip: status !== "authenticated",
    },
  );

  // --- Size Charts ---
  const { data: sizeChartsData } = useGetSizeChartsQuery(
    { per_page: 1000, page: 1 },
    { skip: status !== "authenticated" },
  );

  // ✅ Watch size_chart_category_id and auto-populate product variants (add mode only)
  const watchedSizeChart = form.watch("size_chart_category_id");
  useEffect(() => {
    if (!watchedSizeChart || !sizeChartsData?.data?.data) return;

    // In edit mode, do NOT overwrite saved product_variants with full size chart
    if (mode === "edit" && product?.product_variants?.length > 0) return;

    const selectedChart = sizeChartsData.data.data.find(
      (chart) => chart.id === watchedSizeChart,
    );
    if (!selectedChart) return;

    const sizes = selectedChart.size_chart_values || [];
    if (!sizes.length) return;

    // 1️⃣ Auto-enable "Has Product Variant (Clothings)"
    form.setValue("have_product_variant", 1, { shouldValidate: true });

    // 2️⃣ Build a variant row for each size label
    const autoVariants = sizes.map((sz, idx) => ({
      id: idx + 1,
      name: sz.size_label || "",
      price: "0",
      barcode: "",
      sku: "",
      variant_group_id: "",
      image: "",
      child_product_variants: [],
    }));

    // 3️⃣ Push to form (strip 'id' as done elsewhere)
    const withoutId = autoVariants.map(({ id, ...v }) => v);
    form.setValue("product_variants", withoutId, { shouldValidate: true });

    // 4️⃣ Dispatch a custom event so DynamicProductVariants re-syncs its local state
    window.dispatchEvent(
      new CustomEvent("SIZE_CHART_VARIANTS_APPLIED", { detail: autoVariants }),
    );
  }, [watchedSizeChart, sizeChartsData, mode, product?.product_variants?.length]);

  // ✅ Use only one category API to get categories, subcategories, and child categories
  const { data: categories } = useGetCategoryQuery(
    { page: 1, limit: 10000 },
    {
      skip: status !== "authenticated",
    },
  );

  const { data: bundles = [] } = useGetBundlesQuery(
    {},
    {
      skip: status !== "authenticated",
    },
  );

  const { data: authors } = useGetAuthorsQuery(undefined, {
    // Ensure we only hit /authors once auth token is ready
    skip: status !== "authenticated" || !apiToken,
  });

  // --- Derived subcategories and child categories from single category API ---
  const categoryList = categories?.data?.data || [];

  const selectedCategory = categoryList.find((cat) => cat.id === watchCategory);

  const filteredSubcategories = selectedCategory?.sub_category || [];

  const selectedSubCategory = filteredSubcategories.find(
    (sub) => sub.id === watchSubCategory,
  );

  const filteredChildCategories = selectedSubCategory?.child_categories || [];

  const authorList =
    authors?.data?.data || authors?.data || authors || [];

  const sizeChartOptions =
    sizeChartsData?.data?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  return (
    // --- UPDATE START: Remove old panel styling (now handled by parent) and update internal spacing ---
    // The main `div` containing "General" heading and content is now assumed to be part of the parent's card/panel structure.
    <div className={`${nunito.className}`}>
      {/* NOTE: Removed the redundant 'General' heading here as it's now handled by the parent component (ProductFormFields)
         to align with the new Card/Panel design pattern. */}

      {/* Product Name */}
      <div className="mb-6 relative">
        <Label
          htmlFor="name"
          // --- UPDATE: Adjusted label styling for cleaner, modern look ---
          className="text-sm font-semibold text-gray-700 mb-1 block"
        >
          Product Name <span className="text-red-500">*</span>
        </Label>
        <FormField
          name="name"
          control={form.control}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl>
              <Input
                {...field}
                id="name"
                placeholder="E.g., Samsung Galaxy S21"
                className="rounded-lg border-gray-300 text-sm focus-visible:ring-blue-500 h-10"
              />
            </FormControl>
          )}
        />
        {errors.name && (
          <p className="text-xs text-red-500 text-nowrap mt-1">
            A product name is required and recommended to be unique.
          </p>
        )}
      </div>

      {/* Categories, Subcategories, Child Categories, Brand, Product Type, Bundle (2x3 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Categories */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Category <span className="text-red-500">*</span>
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="category_id"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      // --- UPDATE: Adjusting styles for better Shadcn harmony/placement ---
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem", // rounded-lg
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db", // focus-visible:ring-blue-500
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px", // h-10
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                    }}
                    options={
                      categoryList.length
                        ? categoryList.map((item) => ({
                          value: item.name,
                          label: item.name,
                          id: item.id,
                        }))
                        : []
                    }
                    value={
                      field.value
                        ? {
                          value: field.value,
                          label:
                            categoryList.find((cat) => cat.id === field.value)
                              ?.name || "",
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.id);
                    }}
                    placeholder="Select Category"
                    className="w-full text-sm"
                  />
                </FormControl>
              )}
            />

            <AddCategoryForm />
          </div>
          {errors.category_id && (
            <p className="text-xs text-red-500 text-nowrap mt-1">
              Category must be selected
            </p>
          )}
        </div>

        {/* Subcategories */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Sub Category
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="sub_category_id"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      // --- UPDATE: Adjusting styles for better Shadcn harmony/placement ---
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px",
                        backgroundColor: !watchCategory ? "#f9fafb" : "white", // light gray background when disabled
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                    }}
                    value={
                      field.value
                        ? {
                          value: field.value,
                          label:
                            filteredSubcategories.find(
                              (sub) => sub.id === field.value,
                            )?.name || "",
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.id);
                    }}
                    options={filteredSubcategories.map((item) => ({
                      value: item.name,
                      label: item.name,
                      id: item.id,
                    }))}
                    placeholder={
                      watchCategory
                        ? "Select Subcategory"
                        : "Select Category First"
                    }
                    isDisabled={!watchCategory}
                    className="w-full text-sm"
                  />
                </FormControl>
              )}
            />

            <AddSubCategoryForm categories={categoryList} />
          </div>
        </div>

        {/* Child Categories */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Child Category
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="child_category_id"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      // --- UPDATE: Adjusting styles for better Shadcn harmony/placement ---
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px",
                        backgroundColor: !watchSubCategory
                          ? "#f9fafb"
                          : "white", // light gray background when disabled
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                    }}
                    value={
                      field.value
                        ? {
                          value: field.value,
                          label:
                            filteredChildCategories.find(
                              (child) => child.id === field.value,
                            )?.name || "",
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.id);
                    }}
                    options={filteredChildCategories.map((item) => ({
                      value: item.name,
                      label: item.name,
                      id: item.id,
                    }))}
                    placeholder={
                      watchCategory
                        ? "Select Child Category"
                        : "Select Sub Category First"
                    }
                    isDisabled={!watchSubCategory}
                    className="w-full text-sm"
                  />
                </FormControl>
              )}
            />

            <AddChildCategoryForm subcategories={filteredSubcategories} />
          </div>
        </div>

        {/* Brand */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Brand
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="brand_id"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      // --- UPDATE: Adjusting styles for better Shadcn harmony/placement ---
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                    }}
                    options={
                      brands?.data?.data?.length
                        ? brands?.data?.data?.map((item) => ({
                          value: item.name,
                          label: item.name,
                          id: item.id,
                        }))
                        : []
                    }
                    value={
                      field.value
                        ? {
                          value: field.value,
                          label:
                            brands?.data?.data?.find(
                              (brd) => brd.id === field.value,
                            )?.name || "",
                        }
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.id);
                    }}
                    placeholder="Select Brand (Optional)"
                    className="w-full text-sm"
                  />
                </FormControl>
              )}
            />
            {/* --- UPDATE: Adjusted AddBrandForm button styling for consistency --- */}
            <AddBrandForm imageHandler={imageHandler} />
          </div>
        </div>

        {/* Author */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Author
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="author_id"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 20,
                      }),
                    }}
                    options={
                      Array.isArray(authorList)
                        ? authorList.map((item) => ({
                            value: item.name,
                            label: item.name,
                            id: item.id,
                          }))
                        : []
                    }
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              authorList.find(
                                (a) => a.id === field.value,
                              )?.name || "",
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.id);
                    }}
                    placeholder="Select Author (Optional)"
                    className="w-full text-sm"
                    isClearable
                  />
                </FormControl>
              )}
            />
          </div>
        </div>

        {/* Product Type */}
        <div className="relative">
          <Label
            htmlFor="productType"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Type of Product
          </Label>
          <FormField
            name="product_type"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-lg border-gray-300 focus:ring-blue-500 h-10">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            )}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Select whether this is a standard product or a service.
          </p>
        </div>

        {/* Bundle */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Bundle
          </Label>
          <div className="flex justify-center items-center gap-2">
            <FormField
              name="bundle_ids"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <ReactSelect
                    styles={{
                      // --- UPDATE: Adjusting styles for better Shadcn harmony/placement ---
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.5rem",
                        borderColor: state.isFocused
                          ? "var(--blue-500)"
                          : "#d1d5db",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px var(--blue-500)"
                          : "none",
                        minHeight: "40px",
                      }),
                      menu: (base) => ({ ...base, zIndex: 20 }),
                    }}
                    options={
                      bundles?.bundles?.length
                        ? bundles.bundles.map((item) => ({
                          value: item.title,
                          label: item.title,
                          id: item.id,
                        }))
                        : []
                    }
                    value={
                      field.value && field.value.length > 0
                        ? bundles?.bundles
                          ?.map((item) => ({
                            value: item.title,
                            label: item.title,
                            id: item.id,
                          }))
                          .find((b) => b.id === field.value[0])
                        : null
                    }
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption ? [selectedOption.id] : []);
                    }}
                    placeholder="Select Bundle (Optional)"
                    className="w-full text-sm"
                    isClearable
                  />
                </FormControl>
              )}
            />
            {/* --- UPDATE: Adjusted Link/Button styling for consistency with Shadcn Add forms --- */}
            <Link href="/ecommerce/bundles">
              <Button
                variant="outline"
                className="w-10 h-10 p-0 rounded-lg border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 hover:border-blue-500"
              >
                <Plus size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 relative">
        <Label className="text-sm font-semibold text-gray-700 mb-1 block">
          Description
        </Label>
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormControl>
              <EnhancedRichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Set a description to the product for better visibility"
                onImageUpload={multipleImageHandler || imageHandler}
                // --- UPDATE: Added explicit styling to make the editor container look consistent ---
                className="rounded-lg border border-gray-300 min-h-[200px]"
              />
            </FormControl>
          )}
        />
      </div>

      {/* Serial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="relative">
          <Label
            htmlFor="serialImei"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Serial <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <FormField
              name="serial"
              control={form.control}
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    id="serial"
                    placeholder="Enter serial number or use scanner"
                    className="pr-12 rounded-lg border-gray-300 focus-visible:ring-blue-500 h-10"
                  />
                </FormControl>
              )}
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer p-1 text-gray-500 hover:text-blue-600 transition">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </div>
        {/* Size Category / Size Chart */}
        <div className="relative">
          <Label className="text-sm font-semibold text-gray-700 mb-1 block">
            Size Category
          </Label>
          <FormField
            name="size_chart_category_id"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <ReactSelect
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: state.isFocused
                        ? "var(--blue-500)"
                        : "#d1d5db",
                      boxShadow: state.isFocused
                        ? "0 0 0 1px var(--blue-500)"
                        : "none",
                      minHeight: "40px",
                    }),
                    menu: (base) => ({ ...base, zIndex: 20 }),
                  }}
                  isSearchable
                  options={sizeChartOptions}
                  value={
                    field.value
                      ? sizeChartOptions.find(
                        (opt) => opt.value === field.value,
                      ) || null
                      : null
                  }
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption ? selectedOption.value : "")
                  }
                  placeholder="Select Size Category (Optional)"
                  className="w-full text-sm"
                  isClearable
                />
              </FormControl>
            )}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Link this product with a size category or chart if applicable.
          </p>
        </div>
        {/* Empty column for alignment (2-column layout) */}
        <div></div>
      </div>

      {/* Meta Title & Meta Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Meta Title */}
        <div className="relative">
          <Label
            htmlFor="meta_title"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Meta Title
          </Label>
          <FormField
            name="meta_title"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="meta_title"
                  placeholder="Enter meta title for SEO"
                  className="rounded-lg border-gray-300 focus-visible:ring-blue-500 h-10"
                />
              </FormControl>
            )}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Recommended: 50–60 characters.
          </p>
        </div>

        {/* Meta Description */}
        <div className="relative">
          <Label
            htmlFor="meta_description"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Meta Description
          </Label>
          <FormField
            name="meta_description"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  id="meta_description"
                  placeholder="Enter meta description for SEO"
                  className="rounded-lg border-gray-300 focus-visible:ring-blue-500 h-10"
                />
              </FormControl>
            )}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Recommended: 120–160 characters.
          </p>
        </div>
      </div>
    </div>
  );
}
