"use client";
import { FormControl, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { useGetBrandsQuery } from "@/app/store/api/brandsApi";
import { setToken } from "@/app/store/authSlice";
import { useGetCategoryQuery } from "@/app/store/api/categoryApi";
const AddCategoryForm = dynamic(() => import("./AddCategoryForm"), {
  ssr: false,
});
const AddSubCategoryForm = dynamic(() => import("./AddSubCategoryForm"), {
  ssr: false,
});
const AddBrandForm = dynamic(() => import("./AddBrandForm"), { ssr: false });
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

export default function ProductDetailsFields({ form, imageHandler, errors }) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const { data: brands } = useGetBrandsQuery(undefined, {
    skip: status !== "authenticated",
  });

  const { data: categories } = useGetCategoryQuery(undefined, {
    skip: status !== "authenticated",
  });

  const subcategories = categories?.data?.length
    ? categories.data.flatMap((item) => item.sub_category ?? [])
    : [];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Product Details
      </h3>

      {/* Categories */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Category</Label>
        <div className="flex justify-center items-center gap-2">
          <FormField
            name="category_id"
            control={form.control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl>
                <ReactSelect
                  options={
                    categories?.data?.length
                      ? categories.data.map((item) => ({
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
                            categories?.data?.find(
                              (cat) => cat.id === field.value
                            )?.name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption?.id);
                  }}
                  placeholder="Select Category"
                  className="w-full"
                />
              </FormControl>
            )}
          />

          {/* add category */}
          <AddCategoryForm />
        </div>
        {errors.category_id && (
          <p className="text-xs text-red-500 text-nowrap">
            Category must be selected
          </p>
        )}
      </div>

      {/* Subcategories */}
      <div className="space-y-2 mb-4">
        <Label className="text-sm font-medium text-gray-700">Subcategory</Label>
        <div className="flex justify-center items-center gap-2">
          <FormField
            name="sub_category_id"
            control={form.control}
            render={({ field }) => (
              <ReactSelect
                value={
                  field.value
                    ? {
                        value: field.value,
                        label:
                          subcategories.find((sub) => sub.id === field.value)
                            ?.name || "",
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  field.onChange(selectedOption?.id);
                }}
                options={subcategories.map((item) => ({
                  value: item?.name,
                  label: item?.name,
                  id: item?.id,
                }))}
                placeholder="Select Subcategory"
                className="w-full"
              />
            )}
          />
          <AddSubCategoryForm categories={categories} />
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Brand</Label>
        <div className="flex justify-center items-center gap-2">
          <FormField
            name="brand_id"
            control={form.control}
            render={({ field }) => (
              <FormControl>
                <ReactSelect
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
                              (brd) => brd.id === field.value
                            )?.name || "",
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption?.id);
                  }}
                  placeholder="Select Category"
                  className="w-full"
                />
              </FormControl>
            )}
          />
          <AddBrandForm imageHandler={imageHandler} />
        </div>
      </div>
    </div>
  );
}
