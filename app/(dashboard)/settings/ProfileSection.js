"use client";
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Camera, Edit3, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "@/app/store/api/profileApi";
import { imageUpload, setPreview, resetPreview } from "@/app/store/imageSlice";
import { useShopCategoryQuery } from "@/app/store/api/invoiceSettingsApi";

const ProfileSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    outlet_name: "",
    owner_name: "",
    email: "",
    phone: "",
    web_address: "",
    address: "",
    zipcode: "",
    shop_category: "",
  });

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const imagePreview = useSelector((state) => state.image.preview);
  const { data: session, update: updateSession } = useSession();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();


  const {data : shopCategory} = useShopCategoryQuery();


  // Initialize form data when session is available
  useMemo(() => {
    if (session?.user) {
      setFormData({
        outlet_name: session.user.outlet_name || "",
        owner_name: session.user.owner_name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        web_address: session.user.web_address || "",
        address: session.user.address || "",
        zipcode: session.user.zipcode || "",
        shop_category: session.user.shop_category || "",
      });
    }
  }, [session]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      dispatch(setPreview(imageUrl));
    }
  };

  const handleSave = async () => {
    if (!session?.accessToken) {
      toast.error("Authentication required");
      return;
    }

    toast.loading("Updating Profile...");

    try {
      let profile_pic = session?.user?.profile_pic;

      // Upload image if a new one is selected
      if (imageFile) {
        try {
          profile_pic = await dispatch(
            imageUpload({
              image: imageFile,
              token: session.accessToken,
            })
          ).unwrap();
        } catch (imageError) {
          console.error("Image upload failed:", imageError);
          toast.dismiss();
          toast.error("Failed to upload image");
          return;
        }
      }

      // Prepare the complete payload matching your API structure
      const payload = {
        id: session.user.id,
        user_name: session.user.user_name,
        outlet_name: formData.outlet_name,
        web_address: formData.web_address,
        owner_name: formData.owner_name,
        email: formData.email,
        phone: formData.phone,
        pin: session.user.pin,
        uuid: session.user.uuid,
        signature: session.user.signature,
        currency: session.user.currency,
        logo: session.user.logo,
        contact_number: session.user.contact_number,
        address: formData.address,
        status: session.user.status,
        country: session.user.country,
        latitude: session.user.latitude,
        otp_verified_ind: session.user.otp_verified_ind,
        otp_code: session.user.otp_code,
        longitude: session.user.longitude,
        country_code: session.user.country_code,
        fcm_token: session.user.fcm_token,
        city: session.user.city,
        district: session.user.district,
        zipcode: formData.zipcode,
        multibranch: session.user.multibranch,
        type: session.user.type,
        profile_pic: profile_pic,
        cover_pic: session.user.cover_pic,
        employee_id: session.user.employee_id,
        trade_license: session.user.trade_license,
        shop_category: formData.shop_category,
      };

      const response = await updateProfile(payload).unwrap();

      if (response.success) {
        toast.dismiss();
        toast.success("Profile updated successfully!");

        console.log(session);

        // Update the session with new data
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...formData,
            profile_pic: profile_pic,
          },
        });

        setIsEditing(false);
        dispatch(resetPreview());
        setImageFile(null);
      } else {
        toast.dismiss();
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.dismiss();
      toast.error("An error occurred while updating profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    dispatch(resetPreview());
    setImageFile(null);
    // Reset form data to original values
    if (session?.user) {
      setFormData({
        outlet_name: session.user.outlet_name || "",
        owner_name: session.user.owner_name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        web_address: session.user.web_address || "",
        address: session.user.address || "",
        zipcode: session.user.zipcode || "",
        shop_category: "",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-6">
        {/* Profile Picture */}
        <div className="relative">
          <Avatar className="w-20 h-20 shadow-md">
            <AvatarImage
              src={imagePreview || session?.user?.profile_pic}
              key={imagePreview || session?.user?.profile_pic}
            />
            <AvatarFallback className="text-lg font-semibold bg-blue-500 text-white">
              {session?.user?.owner_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full p-0 bg-white shadow-md hover:bg-gray-50 border"
              onClick={handleImageClick}
            >
              <Camera className="w-3 h-3" />
            </Button>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {session?.user?.owner_name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {session?.user?.outlet_name}
          </p>
        </div>

        {/* Change Button */}
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit3 className="w-4 h-4 mr-2" />
          {isEditing ? "Cancel" : "Change"}
        </Button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="space-y-6 mt-6">
          {/* Shop and Owner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={formData.outlet_name}
                onChange={(e) =>
                  handleInputChange("outlet_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input
                id="owner-name"
                value={formData.owner_name}
                onChange={(e) =>
                  handleInputChange("owner_name", e.target.value)
                }
              />
            </div>
          </div>

          {/* Email and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Account Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Shop Category</Label>
              <Select
                value={formData.shop_category}
                onValueChange={(value) =>
                  handleInputChange("shop_category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {shopCategory && shopCategory?.data?.length ? (
                    shopCategory.data.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-category" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Account Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={formData.outlet_name}
                onChange={(e) =>
                  handleInputChange("outlet_name", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-site">Company Site</Label>
              <Input
                id="company-site"
                type="url"
                value={formData.web_address}
                onChange={(e) =>
                  handleInputChange("web_address", e.target.value)
                }
              />
            </div>
          </div>

          {/* Address and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input
                id="postal-code"
                value={formData.zipcode}
                onChange={(e) => handleInputChange("zipcode", e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProfileSection;
