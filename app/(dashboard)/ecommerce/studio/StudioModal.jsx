"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import {
  useCreateStudio,
  useUpdateStudio,
  useVendorList,
} from "@/apiHooks/hooks/useVendorsAndStudio";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";
import useProductList from "@/customHooks/useProductList";
import useProductSearchFilter from "@/customHooks/useProductSearchFilter";

export default function StudioModal({ open, onClose, studio }) {
  const { data: session } = useSession();
  const isEdit = !!studio;
  const create = useCreateStudio();
  const update = useUpdateStudio();

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    vendor_id: "",
    product_ids: [],
    description: "",
    video_link: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [vendorQuery, setVendorQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");

  const { list: vendorList, search: vendorSearch } = useVendorList(vendorQuery);
  const { products: productList, isLoading: loadingProducts } = useProductList(
    1,
    50
  );
  const { searchResults, searchProducts, isSearching } =
    useProductSearchFilter();

  useEffect(() => {
    if (studio) {
      setForm({
        vendor_id: studio.vendor_id,
        product_ids: studio.product_ids || [],
        description: studio.description || "",
        video_link: studio.video_link || "",
      });
    } else {
      setForm({
        vendor_id: "",
        product_ids: [],
        description: "",
        video_link: "",
      });
    }
  }, [studio]);

  // Debounce product search
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (productQuery) {
        searchProducts({ keyword: productQuery });
      }
    }, 600);
    return () => clearTimeout(debounce);
  }, [productQuery]);

  const displayedProducts =
    productQuery && searchResults?.data?.data?.length
      ? searchResults.data.data
      : productList?.data?.data || [];

  const displayedVendors =
    vendorQuery && vendorSearch?.data?.data?.data?.length
      ? vendorSearch.data.data.data
      : vendorList?.data?.data?.data || [];

  const handleUploadVideo = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file_name", file);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/file-upload`,
        fd,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );
      return res.data.path;
    } catch (err) {
      toast.error("Video upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalVideoLink = form.video_link;

    if (videoFile) {
      const uploaded = await handleUploadVideo(videoFile);
      if (!uploaded) return;
      finalVideoLink = uploaded;
    }

    const payload = {
      vendor_id: Number(form.vendor_id),
      product_ids: form.product_ids.map(Number),
      video_link: finalVideoLink,
      description: form.description,
    };

    try {
      const res = isEdit
        ? await update.mutateAsync({ id: studio.id, payload })
        : await create.mutateAsync(payload);

      toast.success(res.message || "Success");
      onClose();
    } catch {
      toast.error("Failed to save studio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Studio" : "Create New Studio"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Vendor */}
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Vendor
            </label>
            <Select
              placeholder="Select Vendor"
              options={
                displayedVendors?.map((v) => ({
                  label: v.name,
                  value: v.id,
                })) || []
              }
              value={
                form.vendor_id
                  ? {
                      label:
                        displayedVendors.find((v) => v.id === form.vendor_id)
                          ?.name || "Selected",
                      value: form.vendor_id,
                    }
                  : null
              }
              onInputChange={setVendorQuery}
              onChange={(opt) =>
                setForm((p) => ({ ...p, vendor_id: opt?.value }))
              }
              isSearchable
            />
          </div>

          {/* Products */}
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Products
            </label>
            <Select
              isMulti
              placeholder="Select Products"
              options={
                displayedProducts?.map((p) => ({
                  label: p.name,
                  value: p.id,
                })) || []
              }
              isLoading={loadingProducts || isSearching}
              value={form.product_ids.map((id) => ({
                label:
                  displayedProducts.find((p) => p.id === id)?.name || `#${id}`,
                value: id,
              }))}
              onInputChange={setProductQuery}
              onChange={(opts) =>
                setForm((p) => ({
                  ...p,
                  product_ids: opts.map((o) => o.value),
                }))
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Enter description"
            />
          </div>

          {/* Video */}
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">
              Video
            </label>
            {form.video_link && !videoFile && (
              <video
                src={form.video_link}
                controls
                className="w-full h-44 rounded-md border mb-2"
              />
            )}
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading
                ? "Uploading..."
                : isEdit
                ? "Update Studio"
                : "Save Studio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
