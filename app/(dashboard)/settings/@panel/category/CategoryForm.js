"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { createCategory, updateCategory } from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

// eslint-disable-next-line react/prop-types
export default function CategoryForm({ onClose, editableCategory = null }) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState({});

  // const handleSubmit = async (id,formData) => {
  //   startTransition(async () => {
  //     try {
  //       const res = await (editableCategory ? updateCategory(id,formData) : createCategory(formData));
  //       console.log(res);
  //       if (res.status) {
  //         toast.success(res.message);
  //         setPreview({});
  //         onClose(false);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
  // };

  const handleSubmit = async (id, rawFormData) => {
    startTransition(async () => {
      try {
        // ✅ Build a new FormData manually
        const formData = new FormData();

        // --- Text fields ---
        formData.append("name", rawFormData.get("name"));
        formData.append("description", rawFormData.get("description") || "");
        formData.append("is_featured", rawFormData.get("is_featured") ? 1 : 0);

        // --- Image logic ---
        const imageFile = rawFormData.get("image_url");
        if (imageFile && imageFile.size > 0) {
          // user chose new image
          formData.append("image_url", imageFile);
        } else if (editableCategory && editableCategory.image_url) {
          // keep old image url
          formData.append("existing_image_url", editableCategory.image_url);
        }

        // --- Banner logic ---
        const bannerFile = rawFormData.get("banner");
        if (bannerFile && bannerFile.size > 0) {
          formData.append("banner", bannerFile);
        } else if (editableCategory && editableCategory.banner) {
          formData.append("existing_banner", editableCategory.banner);
        }

        // --- Call correct endpoint ---
        const res = await (editableCategory
          ? updateCategory(id, formData)
          : createCategory(formData));

        if (res.status) {
          toast.success(res.message);
          setPreview({});
          onClose(false);
        }
      } catch (error) {
        console.error("Update failed:", error);
        toast.error("Failed to save category");
      }
    });
  };

  const handleImage = (e, field_name) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({
        ...prev,
        [field_name]: url,
      }));
    }
  };

  console.log(editableCategory);

  return (
    <div className=" bg-gradient-to-br  flex items-center justify-center">
      <Card className="w-full  shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="space-y-8">
          <form
            action={
              editableCategory
                ? (formData) => handleSubmit(editableCategory.id, formData)
                : (formData) => handleSubmit(null, formData)
            }
            className="space-y-8"
          >
            {/* Category Name */}
            <div className="space-y-3">
              <Label
                htmlFor="categoryName"
                className="text-base font-semibold text-gray-700"
              >
                Category Name
              </Label>
              <Input
                id="categoryName"
                placeholder="Enter category name..."
                name="name"
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
                required
                defaultValue={editableCategory ? editableCategory.name : ""}
              />
            </div>

            {/* Category Description */}
            <div className="space-y-3">
              <Label
                htmlFor="categoryDescription"
                className="text-base font-semibold text-gray-700"
              >
                Category Description
              </Label>
              <Textarea
                id="categoryDescription"
                placeholder="Enter category description..."
                name="description"
                className="min-h-[120px] text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl resize-none"
                defaultValue={
                  editableCategory ? editableCategory.description : ""
                }
              />
            </div>

            {/* Upload Category Image */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Upload Category Image
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="categoryImage"
                  accept="image/*"
                  name="image_url"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImage(e, "image_url")}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer h-32">
                  {preview?.image_url || editableCategory?.image_url ? (
                    <Image
                      src={preview?.image_url || editableCategory?.image_url}
                      alt="preview-image"
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Category Banner */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">
                Upload Category Banner
              </Label>
              <div className="relative">
                <input
                  type="file"
                  id="categoryBanner"
                  accept="image/*"
                  name="banner"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImage(e, "banner")}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer h-32">
                  {preview?.banner || editableCategory?.banner ? (
                    <Image
                      src={preview?.banner || editableCategory?.banner}
                      alt="preview-image"
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* featured category checkbox */}
            <div className="flex gap-2 items-center">
              <Checkbox
                name="is_featured"
                defaultChecked={
                  editableCategory ? editableCategory?.is_featured : false
                }
              />
              <Label className="text-base font-semibold text-gray-700">
                Featured Category
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              disable={`${isPending}`}
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
