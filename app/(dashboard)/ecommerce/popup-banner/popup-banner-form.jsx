"use client";
import { React, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { imageUpload } from "@/app/store/imageSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSavePopupBannerMutation } from "@/app/store/api/popupBannerApi";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function PopupBannerForm({
  isOpen,
  onClose,
  onSuccess,
  editingBanner,
  token,
}) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: editingBanner?.title || "",
    url: editingBanner?.url || "",
    button_text: editingBanner?.button_text || "",
    description: editingBanner?.description || "",
    image: editingBanner?.image || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [saveBanner, { isLoading }] = useSavePopupBannerMutation();
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imagePath = formData.image;

      if (imageFile) {
        setUploading(true);
        const res = await dispatch(
          imageUpload({ image: imageFile, token })
        ).unwrap();
        imagePath = res;
        setUploading(false);
      }

      const payload = { ...formData, image: imagePath };

      await saveBanner(payload).unwrap();
      toast.success(
        editingBanner ? "Popup Banner updated!" : "Popup Banner created!"
      );
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save popup banner");
      setUploading(false);
    }
  };

  return (
    // popup banner form dialog
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBanner ? "Update" : "Add"} Popup Banner
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Target URL</Label>
            <Input
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input
              name="button_text"
              value={formData.button_text}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Image</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
            {(formData.image || imageFile) && (
              <div className="relative w-full h-40 mt-2 rounded overflow-hidden border">
                <Image
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : formData.image
                  }
                  fill
                  alt="Preview"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || uploading}
              className="w-full"
            >
              {(isLoading || uploading) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingBanner ? "Update Banner" : "Create Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
