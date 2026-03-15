/* eslint-disable react/prop-types */
"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";
// import 'react-quill/dist/quill.snow.css';
import { imageUpload } from "@/app/store/imageSlice";
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});
import { useSession } from "next-auth/react";

/* =======================
   DYNAMIC REACT QUILL
======================= */

export function BlogForm({
  blog,
  onSubmit, // create / update handler from page
  isLoading,
  submitLabel = "Save Blog",
}) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  console.log(session);
  const fileInputRef = useRef(null);

  /* =======================
     STATE
  ======================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* =======================
     PREFILL (EDIT MODE)
  ======================= */
  useEffect(() => {
    if (blog) {
      setTitle(blog.title || "");
      setDescription(blog.description || "");
      setStatus(blog.status === 1);
      setPreview(blog.image || "");
    }
  }, [blog]);

  /* =======================
     IMAGE SELECT (NO UPLOAD)
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

    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSubmitting(true);

    // Store loading toast id
    const toastId = toast.loading(
      blog ? "Updating blog..." : "Creating blog..."
    );

    try {
      let imagePath = blog?.image || "";

      /* Upload image ONLY on submit */
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
          toast.error("Failed to upload image");
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title,
        description, // HTML from React Quill
        image: imagePath,
        status: status ? 1 : 0,
      };

      await onSubmit(payload);

      // ✅ SUCCESS TOAST
      toast.success(
        blog ? "Blog updated successfully!" : "Blog created successfully!",
        { id: toastId }
      );
    } catch (err) {
      console.error("Blog submit error:", err);
      toast.error("Failed to save blog", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================
     QUILL CONFIG
  ======================= */
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TITLE */}
      <div className="space-y-1">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog title"
          required
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-1">
        <Label>Description</Label>
        <ReactQuill
          value={description}
          onChange={setDescription}
          modules={quillModules}
          theme="snow"
          className="bg-white"
        />
      </div>

      {/* IMAGE */}
      <div className="space-y-2">
        <Label>Blog Image</Label>

        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Blog"
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

      {/* STATUS */}
      <div className="flex items-center gap-3">
        <Switch checked={status} onCheckedChange={setStatus} />
        <Label>{status ? "Published" : "Draft"}</Label>
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
