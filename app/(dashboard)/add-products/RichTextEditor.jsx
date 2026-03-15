"use client";

import { React, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EnhancedRichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  className = "",
  onImageUpload, // Added prop for handling image uploads to server
}) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageConfig, setImageConfig] = useState({
    alt: "",
    link: "",
    width: "100",
    alignment: "center",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Custom image handler for multiple uploads
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset file input
    e.target.value = "";

    // Check if onImageUpload handler is provided
    if (!onImageUpload) {
      alert(
        "Image upload handler is not configured. Please provide onImageUpload prop."
      );
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const uploadedUrls = await onImageUpload(files);

      // Map URLs to file objects
      const uploadedImages = files.map((file, index) => ({
        file,
        url: uploadedUrls[index], // Get corresponding URL from array
        name: file.name,
      }));

      setPendingImages(uploadedImages);
      setCurrentImageIndex(0);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
      setShowImageDialog(true);
    } catch (error) {
      setUploadError("Failed to upload images. Please try again.");
      console.error("[v0] Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const insertCurrentImage = () => {
    if (!quillRef.current || pendingImages.length === 0) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    const currentImage = pendingImages[currentImageIndex];

    // Build image HTML
    let wrapperStyle = "";
    let imageStyle = `width: ${imageConfig.width}%; max-width: 100%; height: auto;`;

    if (imageConfig.alignment === "left") {
      wrapperStyle =
        "float: left; margin-right: 15px; margin-bottom: 10px; clear: none;";
      imageStyle = `width: ${imageConfig.width}%; max-width: 100%; height: auto; display: block;`;
    } else if (imageConfig.alignment === "right") {
      wrapperStyle =
        "float: right; margin-left: 15px; margin-bottom: 10px; clear: none;";
      imageStyle = `width: ${imageConfig.width}%; max-width: 100%; height: auto; display: block;`;
    } else if (imageConfig.alignment === "center") {
      wrapperStyle = "display: block; margin: 10px auto; clear: both;";
      imageStyle = `width: ${imageConfig.width}%; max-width: 100%; height: auto; display: block; margin: 0 auto;`;
    }

    let imageHtml = `<img src="${currentImage.url}" alt="${
      imageConfig.alt || currentImage.name
    }" style="${imageStyle}" />`;

    // Wrap in link if provided
    if (imageConfig.link) {
      imageHtml = `<a href="${imageConfig.link}" target="_blank" rel="noopener noreferrer" style="display: inline-block;">${imageHtml}</a>`;
    }

    // Wrap in div with alignment styles
    const finalHtml = `<div style="${wrapperStyle}">${imageHtml}</div>`;

    // Insert HTML at cursor position
    editor.clipboard.dangerouslyPasteHTML(range.index, finalHtml);
    editor.setSelection(range.index + 1);

    // Move to next image or close dialog
    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
    } else {
      setShowImageDialog(false);
      setPendingImages([]);
      setCurrentImageIndex(0);
    }
  };

  const skipCurrentImage = () => {
    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageConfig({
        alt: "",
        link: "",
        width: "100",
        alignment: "center",
      });
    } else {
      setShowImageDialog(false);
      setPendingImages([]);
      setCurrentImageIndex(0);
    }
  };

  // Comprehensive toolbar with all ReactQuill features
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "video"],
          [{ image: "custom-image" }],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  return (
    <div className={`enhanced-rich-text-editor ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={isUploading}
      />

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          minHeight: "200px",
          maxHeight: "none",
        }}
      />

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Uploading images to server...</p>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Configuration Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configure Image {currentImageIndex + 1} of {pendingImages.length}
            </DialogTitle>
          </DialogHeader>

          {pendingImages[currentImageIndex] && (
            <div className="space-y-4 py-4">
              {/* Image Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden">
                <img
                  src={
                    pendingImages[currentImageIndex].url || "/placeholder.svg"
                  }
                  alt="Preview"
                  style={{
                    width: `${imageConfig.width}%`,
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    margin:
                      imageConfig.alignment === "center"
                        ? "0 auto"
                        : imageConfig.alignment === "left"
                        ? "0 auto 0 0"
                        : "0 0 0 auto",
                  }}
                />
              </div>

              {/* Alt Text (Required for SEO) */}
              <div className="space-y-2">
                <Label htmlFor="alt-text">
                  Alt Text <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alt-text"
                  placeholder="Describe the image for accessibility and SEO"
                  value={imageConfig.alt}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, alt: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Required for SEO and accessibility
                </p>
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <Label htmlFor="link-url">Link URL (Optional)</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={imageConfig.link}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, link: e.target.value })
                  }
                />
              </div>

              {/* Width Control */}
              {/* <div className="space-y-2">
                <Label htmlFor="width">Width: {imageConfig.width}%</Label>
                <input
                  id="width"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={imageConfig.width}
                  onChange={(e) =>
                    setImageConfig({ ...imageConfig, width: e.target.value })
                  }
                  className="w-full"
                />
              </div> */}

              {/* Alignment */}
              {/* <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <Select
                  value={imageConfig.alignment}
                  onValueChange={(value) =>
                    setImageConfig({ ...imageConfig, alignment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">
                      Left (allows text wrap)
                    </SelectItem>
                    <SelectItem value="center">Center (block)</SelectItem>
                    <SelectItem value="right">
                      Right (allows text wrap)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Left/Right alignment allows multiple images in the same row
                </p>
              </div> */}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={skipCurrentImage}>
              Skip This Image
            </Button>
            <Button
              onClick={insertCurrentImage}
              disabled={!imageConfig.alt.trim()}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .enhanced-rich-text-editor .ql-container {
          min-height: 200px;
          max-height: none;
          font-size: 14px;
        }

        .enhanced-rich-text-editor .ql-editor {
          min-height: 200px;
          max-height: none;
          overflow-y: auto;
        }

        /* Added proper float handling and clearfix for side-by-side images */
        .enhanced-rich-text-editor .ql-editor::after {
          content: "";
          display: table;
          clear: both;
        }

        .enhanced-rich-text-editor .ql-editor > div {
          max-width: 100%;
        }

        .enhanced-rich-text-editor .ql-editor img {
          cursor: move;
          max-width: 100%;
          height: auto;
        }

        .enhanced-rich-text-editor .ql-editor img:hover {
          outline: 2px solid #3b82f6;
        }

        .enhanced-rich-text-editor .ql-editor p:has(+ div[style*="float"]) {
          overflow: visible;
        }

        .enhanced-rich-text-editor .ql-editor div[style*="float: left"],
        .enhanced-rich-text-editor .ql-editor div[style*="float: right"] {
          max-width: 50%;
        }
      `}</style>
    </div>
  );
}
