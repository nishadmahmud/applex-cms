"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useDeliveryMethodSaveMutation } from "@/app/store/api/deliveryApi"


export default function CreateUi({ onClose }) {
  const [formData, setFormData] = useState({
    type_name:  "",
    icon_letter:  "",
  })

  const [deliveryMethodSave, { isLoading }] = useDeliveryMethodSaveMutation();


  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const payload = {
      ...formData,
    };

    try {
      const response = await deliveryMethodSave(payload).unwrap();
      if (response.success) {
        toast.success('Payment created');
      }
      onClose();
      setFormData((prev) => ({
        ...prev,
        icon_letter : "",
        type_name : ""
      }));
    } catch (error) {
      toast.error('error occured try again');
    }
  }

  

  return (
        <form onSubmit={handleSubmit} className="space-y-4">
         
          {/* Payment Method Name */}
          <div className="space-y-2">
            <Label htmlFor="type_name">Delivery Method Name</Label>
            <Input
              id="type_name"
              value={formData.type_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, type_name: e.target.value }))}
              placeholder="Enter delivery method name"
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
                maxLength={1}
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
