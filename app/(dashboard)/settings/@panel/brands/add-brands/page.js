"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BrandForm from "../BrandForm";
import { useCreateBrandMutation } from "@/app/store/api/brandsApi";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { toast } from "sonner";
import { resetPreview } from "@/app/store/imageSlice";
import axios from "axios";

const initialBrandData = {
  name: "",
  description: "",
  image_path: "",
  banner_image: "",
  is_topbrand: false,
};

export default function AddBrandPage() {
  const [brandData, setBrandData] = useState(initialBrandData);
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null); // logo file
  const [bannerFile, setBannerFile] = useState(null); // banner file
  const [createBrand] = useCreateBrandMutation();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const handleInputChange = (field, value) => {
    setBrandData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Multiple‑file upload helper (same as edit page) ---
  const multipleImageHandler = async (filesToUpload) => {
    if (!filesToUpload || filesToUpload.length === 0) return [];
    const imageData = new FormData();
    filesToUpload.forEach((file) => {
      imageData.append("pictures[]", file);
    });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/multiple-file-upload`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res?.data?.path?.length) {
        return res.data.path.map((p) => p.path);
      }
      return [];
    } catch (err) {
      console.error("upload failed", err);
      return [];
    }
  };

  const handleSave = async () => {
    toast.loading("Creating brand...");

    let image_path = "";
    let banner_image = "";

    try {
      // collect whichever files exist
      const filesToUpload = [];
      if (imageFile instanceof File) filesToUpload.push(imageFile);
      if (bannerFile instanceof File) filesToUpload.push(bannerFile);

      // call multiple upload endpoint if needed
      let uploadedPaths = [];
      if (filesToUpload.length > 0) {
        uploadedPaths = await multipleImageHandler(filesToUpload);
      }

      if (uploadedPaths.length === 1) {
        if (imageFile && !bannerFile) image_path = uploadedPaths[0];
        if (!imageFile && bannerFile) banner_image = uploadedPaths[0];
      }
      if (uploadedPaths.length === 2) {
        image_path = uploadedPaths[0];
        banner_image = uploadedPaths[1];
      }

      const payload = {
        name: brandData.name,
        description: brandData.description,
        image_path,
        banner_image,
        is_topbrand: brandData.is_topbrand,
      };

      const res = await createBrand(payload).unwrap();

      toast.dismiss();
      if (res.success) {
        toast.success("Brand created successfully!");
        setBrandData(initialBrandData);
        setImageFile(null);
        setBannerFile(null);
        dispatch(resetPreview());
      } else {
        toast.error(res.message || "Creation failed");
      }
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Error occurred, try again");
    }
  };

  const handleBack = () => router.back();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Add Brand</h1>
        </div>
      </div>

      <BrandForm
        formData={brandData}
        onChange={handleInputChange}
        onSubmit={handleSave}
        setImageFile={setImageFile}
        setBannerFile={setBannerFile}
      />
    </div>
  );
}
