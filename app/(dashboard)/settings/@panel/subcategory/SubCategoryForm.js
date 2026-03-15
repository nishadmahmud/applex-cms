"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import {
  createSubCategory,
  updateSubCategory,
} from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
const ReactSelect = dynamic(() => import("react-select"), { ssr: false });
// eslint-disable-next-line react/prop-types
export default function SubCategoryForm({ onClose, editableCategory = null }) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState({});
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/category?page=1&limit=100");
      return res.data;
    },
  });

  const handleSubmit = async (formData) => {
    const id = formData.get('category_id');
    if(!id){
        toast.error('Select Category First');
        return;
    }
    startTransition(async () => {
      try {
          const res = await (editableCategory ?  updateSubCategory(formData) :  createSubCategory(formData));
        if (res.success) {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          toast.success(res.message);
          setPreview({});
          onClose(false);
        }else{
            toast.error(res.message)
        }
      } catch (error) {
        console.log(error);
      }
    });
  };




  const handleImage = (e, field_name) => {
    const files = e.target.files;
    if (files.length) {
      const urls = Array.from(files).map((item) => URL.createObjectURL(item));
      setPreview((prev) => ({
        ...prev,
        [field_name]: urls,
      }));
    }
  };


  return (
    <div className=" bg-gradient-to-br  flex items-center justify-center">
      <Card className="w-full  shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="space-y-8">
          <form
            action={handleSubmit}
            className="space-y-8"
          >
            <div>
              {editableCategory && (
                <Input
                  name="subCategoryId"
                  defaultValue={editableCategory?.id}
                  className="hidden"
                />
              )}
              {editableCategory && !preview?.image_url?.length && (
                <Input
                  name="images"
                  defaultValue={editableCategory?.images}
                  className="hidden"
                />
              )}
              {editableCategory && !preview?.banner?.length && (
                <Input
                  name="banners"
                  defaultValue={editableCategory?.banners}
                  className="hidden"
                />
              )}
            </div>
            <div>
              <Label
                htmlFor="categoryName"
                className="text-base font-semibold text-gray-700"
              >
                Select Category
              </Label>
              <ReactSelect
                key={categories?.data?.data}
                name="category_id"
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
                  categories?.data?.data?.length
                    ? categories?.data?.data?.map((item) => ({
                        value: item.id,
                        label: item.name,
                        id: item.id,
                      }))
                    : []
                }
                defaultValue={
                  categories?.data?.data
                    ?.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))
                    .find(
                      (option) => option?.value === editableCategory?.category_id
                    ) || null
                }
                placeholder="Select Category"
                className="w-full text-sm"
              />
            </div>

            {/* Category Name */}
            <div className="space-y-3">
              <Label
                htmlFor="categoryName"
                className="text-base font-semibold text-gray-700"
              >
                Sub Category Name
              </Label>
              <Input
                id="categoryName"
                placeholder="Enter category name..."
                name="name"
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                required
                defaultValue={editableCategory?.name || ""}
              />
            </div>

            {/* Upload sub-Category Image */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Upload Sub Category Image
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="categoryImage"
                  accept="image/*"
                  name="images"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImage(e, "image_url")}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer h-32">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {preview?.image_url?.length
                  ? preview?.image_url.map((item, idx) => (
                      <Image
                        key={idx}
                        src={item}
                        alt="preview-image"
                        height={80}
                        width={80}
                        className="object-cover rounded-xl"
                      />
                    ))
                  : editableCategory?.images?.length
                  ? editableCategory?.images.map((item, idx) => (
                      <Image
                        key={idx}
                        src={item}
                        alt="preview-image"
                        height={80}
                        width={80}
                        className="object-cover rounded-xl"
                      />
                    ))
                  : ""}
              </div>
            </div>

            {/* Upload Category Banner */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Upload Sub Category Banner
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="categoryBanner"
                  accept="image/*"
                  multiple
                  name="banners"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImage(e, "banner")}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer h-32">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {preview?.banner?.length
                  ? preview?.banner.map((item, idx) => (
                      <Image
                        key={idx}
                        src={item}
                        alt="preview-image"
                        height={80}
                        width={80}
                        className="object-cover rounded-xl"
                      />
                    ))
                  : editableCategory?.banners?.length
                  ? editableCategory?.banners.map((item, idx) => (
                      <Image
                        key={idx}
                        src={item}
                        alt="preview-image"
                        height={80}
                        width={80}
                        className="object-cover rounded-xl"
                      />
                    ))
                  : ""}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              disabled={isPending}
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isPending ? "Saving..." : "Save Category"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
