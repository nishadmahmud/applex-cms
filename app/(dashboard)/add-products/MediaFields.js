"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Eye, SquarePen, Trash2, Upload } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// --- UPDATE START: Accept a new prop to report the full image state ---
export default function MediaFields({
  setSelectedImage,
  productImages = [],
  onAllImagesChange,
}) {
  // --- UPDATE END ---
  const [images, setImages] = useState([]); // [{file, preview}]

  // Prefill existing product images when editing
  useEffect(() => {
    // --- UPDATE START: Prevent re-running if images are already set ---
    if (productImages.length > 0 && images.length === 0) {
      const formatted = productImages.map((url, idx) => ({
        file: null, // No local file, only URL
        preview: url,
      }));
      setImages(formatted);
      // Inform the parent of the initial state
      if (onAllImagesChange) {
        onAllImagesChange(formatted);
      }
    }
  }, [productImages, images.length, onAllImagesChange]);
  // --- UPDATE END ---

  // ✅ Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // ← only fires on final unmount now, not after each re‑render
      images.forEach((img) => {
        if (img.file && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);

  const fileInputRef = useRef(null);
  // const [photoIndex, setPhotoIndex] = useState(0);

  const [viewer, setViewer] = useState({
    open: false,
    url: "",
    isVideo: false,
  });

  // Handle file selection
  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updated = [...images, ...newFiles];
    setImages(updated);

    // --- UPDATE START: Inform parent of the complete new state ---
    if (onAllImagesChange) {
      onAllImagesChange(updated);
    }
    // --- UPDATE END ---

    // update parent as object {0: file, 1: file, ...}
    setSelectedImage(() => {
      const obj = {};
      updated.forEach((img, idx) => {
        // --- UPDATE START: Ensure only actual files are added to selectedImage ---
        if (img.file) {
          obj[idx] = img.file;
        }
        // --- UPDATE END ---
      });
      return obj;
    });
  };

  const handleAddField = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdate = (index) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.updateIndex = index;
      fileInputRef.current.click();
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    // --- UPDATE START: Inform parent of the complete new state ---
    if (onAllImagesChange) {
      onAllImagesChange(newImages);
    }
    // --- UPDATE END ---

    setSelectedImage(() => {
      const obj = {};
      newImages.forEach((img, idx) => {
        // --- UPDATE START: Ensure only actual files are added to selectedImage ---
        if (img.file) {
          obj[idx] = img.file;
        }
        // --- UPDATE END ---
      });
      return obj;
    });
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    const updateIndex = e.target.dataset.updateIndex;

    if (files && files.length > 0) {
      if (updateIndex !== undefined) {
        // replace existing
        const updated = [...images];
        updated[updateIndex] = {
          file: files[0],
          preview: URL.createObjectURL(files[0]),
        };
        setImages(updated);

        // --- UPDATE START: Inform parent of the complete new state ---
        if (onAllImagesChange) {
          onAllImagesChange(updated);
        }
        // --- UPDATE END ---

        setSelectedImage(() => {
          const obj = {};
          updated.forEach((img, idx) => {
            // --- UPDATE START: Ensure only actual files are added to selectedImage ---
            if (img.file) {
              obj[idx] = img.file;
            }
            // --- UPDATE END ---
          });
          return obj;
        });

        delete fileInputRef.current.dataset.updateIndex;
      } else {
        handleFiles(files);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg border border-slate-200/60">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Media
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage your product images
        </p>
      </div>

      {/* Grid */}
      <div
        className={`grid gap-5 ${
          images.length > 0 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative group bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-out
      ${index === 0 ? "col-span-2" : ""}`}
          >
            <div className="aspect-square relative bg-slate-100">
              {/* ✅ Detects image or video and renders accordingly */}
              {(() => {
                const isVideo = img.file
                  ? img.file.type?.startsWith("video/")
                  : img.preview?.toLowerCase()?.match(/\.(mp4|mov|webm|ogg)$/);

                return isVideo ? (
                  <div className="relative w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={img.preview}
                      muted
                      playsInline
                      className="object-cover w-full h-full"
                    />
                    {/* Optional play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-10 h-10 opacity-80 drop-shadow"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={img.preview || "/placeholder.svg"}
                    alt={`upload-${index}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                );
              })()}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                <div className="flex gap-2">
                  {/* view */}
                  <button
                    type="button"
                    onClick={() => {
                      const lower = img.preview.toLowerCase();
                      const isVideo =
                        lower.endsWith(".mp4") ||
                        lower.endsWith(".mov") ||
                        lower.endsWith(".webm") ||
                        lower.endsWith(".ogg");

                      setViewer({
                        open: true,
                        url: img.preview,
                        file: img.file || null,
                        isVideo,
                      });
                    }}
                    className="bg-blue-500/95 backdrop-blur-sm text-white px-1.5 py-1 rounded-lg text-sm font-medium hover:bg-blue-600 hover:scale-105 transition-all duration-200 flex items-center gap-1 shadow-lg"
                  >
                    <Eye size={12} />
                  </button>

                  {/* Update */}
                  <button
                    type="button"
                    onClick={() => handleUpdate(index)}
                    className="bg-white/95 backdrop-blur-sm text-slate-700 px-1.5 py-1 rounded-lg text-sm font-medium hover:bg-white hover:scale-105 transition-all duration-200 flex items-center gap-1 shadow-lg"
                  >
                    <SquarePen size={12} />
                    {/* <span className="hidden sm:inline">Edit</span> */}
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="bg-red-500/95 backdrop-blur-sm text-white px-1.5 py-1 rounded-lg text-sm font-medium hover:bg-red-600 hover:scale-105 transition-all duration-200 flex items-center gap-1 shadow-lg"
                  >
                    <Trash2 size={12} />
                    {/* <span className="hidden sm:inline">Delete</span> */}
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-gradient-to-br from-slate-900 to-slate-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
              #{index + 1}
            </div>
          </div>
        ))}

        {/* Upload Button */}
        <div
          onClick={handleAddField}
          className={`relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group aspect-square flex items-center justify-center bg-slate-50/50 
    ${images.length > 0 ? "col-span-2" : ""}`}
        >
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
              <Upload className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                Drop or Click to Upload
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*, video/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* ✅ Handles image or video preview properly */}
      {/* ✅ Popup viewer using Dialog */}
      {viewer.open && (
        <Dialog
          open={viewer.open}
          onOpenChange={(v) => setViewer({ ...viewer, open: v })}
        >
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <DialogContent className="max-w-4xl p-3 sm:p-4 bg-black/80">
            {viewer.isVideo ? (
              <div className="relative w-full flex items-center justify-center bg-black">
                <video
                  key={viewer.url}
                  src={viewer.url}
                  type={viewer.file?.type || "video/mp4"}
                  muted
                  controls
                  playsInline
                  autoPlay
                  className="max-h-[80vh] w-auto rounded-md bg-black"
                />
              </div>
            ) : (
              <img
                src={viewer.url}
                alt="full-preview"
                className="max-h-[80vh] w-auto rounded-md object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
