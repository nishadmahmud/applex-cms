"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, Edit3 } from "lucide-react"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { imageUpload, resetPreview, setPreview } from "@/app/store/imageSlice"
import { useSession } from "next-auth/react"
import { useEditPaymentTypeMutation } from "@/app/store/api/paymentApi"
import { toast } from "sonner"

export default function EditInterface({ method, onClose }) {
  const [formData, setFormData] = useState({
    type_name: method?.type_name || "",
    icon_letter: method?.icon_letter || "",
    icon_image: method?.icon_image,
  })
  const dispatch = useDispatch();
  const preview = useSelector((state) => state.image.preview);
  const [imageFile, setImageFile] = useState("");
  const { data: session } = useSession();
  const [editPaymentType, { isLoading }] = useEditPaymentTypeMutation();

  if (!method) return null

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res = "";
    if (imageFile) {
      try {
        res = await dispatch(imageUpload({ image: imageFile, token: session?.accessToken })).unwrap();
      } catch (error) {
        toast.error('error occured while image uploading');
        return;
      }
    }
    const payload = {
      ...formData,
      ...(res && { icon_image: res }),
      id: method.id
    };

    try {
      const response = await editPaymentType(payload).unwrap();
      if (response.success) {
        toast.success('Payment Updated');
        onClose();
        dispatch(resetPreview());
        setImageFile("")
        setFormData((prev) => ({
          ...prev,
          icon_image: method.icon_image
        }));
      }else{
        toast.error('Something went wrong');
      }

    } catch (error) {
      toast.error('error occured try again');
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const image = URL.createObjectURL(file)
      dispatch(setPreview(image))
      setImageFile(file);
    }
  }

  return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Payment Method Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                {method.icon_image ? (
                  <Image
                    src={preview || method?.icon_image}
                    alt="Payment method"
                    className="w-full h-full object-contain"
                    width={50}
                    height={50}
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload").click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Method Name */}
          <div className="space-y-2">
            <Label htmlFor="type_name">Payment Method Name</Label>
            <Input
              id="type_name"
              value={formData.type_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, type_name: e.target.value }))}
              placeholder="Enter payment method name"
              required
            />
          </div>

          {/* Method Code */}
          <div className="space-y-2">
            <Label htmlFor="icon_letter">Method Code</Label>
            <div className="flex items-center gap-3">
              <Input
                id="icon_letter"
                value={formData.icon_letter}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon_letter: e.target.value }))}
                placeholder="e.g., B, D, C"
                className="w-20 text-center font-mono"
                maxLength={3}
                required
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Preview:</span>
                <div
                  className={`w-8 h-8 bg-[#58C17E] rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                >
                  {formData.icon_letter || "?"}
                </div>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
  )
}
