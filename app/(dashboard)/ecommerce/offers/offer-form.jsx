/* eslint-disable react/prop-types */
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useGetBrandsQuery } from "@/app/store/api/brandsApi";
import Select from "react-select";
import "react-quill-new/dist/quill.snow.css";
import { imageUpload } from "@/app/store/imageSlice";
import { useSession } from "next-auth/react";

export function OfferForm({
  offer,
  onSubmit,
  isLoading,
  submitLabel = "Save Offer",
}) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  /* =======================
     STATE
  ======================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: brandsRes, isLoading: brandsLoading } = useGetBrandsQuery({ page: 1, limit: 1000 });
  const brands = brandsRes?.data?.data || brandsRes?.data || [];

  /* =======================
     PREFILL (EDIT MODE)
  ======================= */
  useEffect(() => {
    if (offer) {
      setTitle(offer.title || "");
      setDescription(offer.description || "");
      setBrandId(offer.brand_id ? offer.brand_id.toString() : "");
      setPreview(offer.image || "");
    }
  }, [offer]);

  /* =======================
     IMAGE SELECT
  ======================= */
  const handleImageSelect = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSubmitting(true);

    const toastId = toast.loading(
      offer ? "Updating offer..." : "Creating offer..."
    );

    try {
      let imagePath = offer?.image || "";

      /* Upload image only if changed */
      if (imageFile) {
        try {
          const uploadResult = await dispatch(
            imageUpload({
              image: imageFile,
              token: session?.accessToken || session?.user?.accessToken,
            })
          ).unwrap();

          imagePath = uploadResult;
        } catch (err) {
          console.error("Image upload failed:", err);
          toast.dismiss(toastId);
          toast.error("Image upload failed");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title,
        description,
        brand_id: brandId || null,
        image: imagePath,
      };

      await onSubmit(payload);

      toast.success(
        offer ? "Offer updated successfully!" : "Offer created successfully!",
        { id: toastId }
      );
    } catch (err) {
      console.error("Offer submit error:", err);
      toast.error("Failed to save offer", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TITLE */}
      <div className="space-y-1">
        <Label>Offer Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter offer title"
          required
        />
      </div>

      {/* BRAND */}
      <div className="space-y-1">
        <Label>Associated Brand (Optional)</Label>
        <Select
          options={brands.map(b => ({ value: b.id.toString(), label: b.name }))}
          value={brandId ? { value: brandId, label: brands.find(b => b.id.toString() === brandId)?.name || "" } : null}
          onChange={(option) => setBrandId(option ? option.value : "")}
          isDisabled={brandsLoading}
          placeholder="Search and select a brand..."
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter offer description..."
          rows={4}
          className="bg-white resize-none"
        />
      </div>

      {/* IMAGE */}
      <div className="space-y-2">
        <Label>Offer Image</Label>

        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Offer"
                className="h-32 mx-auto object-cover rounded"
              />
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />
        </div>
      </div>

      {/* SUBMIT */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || submitting}
      >
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
