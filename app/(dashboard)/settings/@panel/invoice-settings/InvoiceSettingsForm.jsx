"use client";

import React from "react";
import {
  useGetInvoiceSettingsApiQuery,
  useSaveInvoiceSettingsMutation,
} from "@/app/store/api/invoiceSettingsApi";
import { imageUpload, resetPreview } from "@/app/store/imageSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import dynamic from "next/dynamic";
// ✅ Import React Quill dynamically (to avoid SSR issues)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const InvoiceSettingsForm = () => {
  const { data: session, status, update: updateSession } = useSession();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [shopLogoFile, setShopLogoFile] = useState(null);
  const [signAuthorityFile, setSignAuthorityFile] = useState(null);
  const shopLogoInputRef = useRef(null);
  const signAuthorityInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState({
    shop_logo: "",
    sign_authority: "",
  });

  const { data: invoiceData, isLoading } = useGetInvoiceSettingsApiQuery(
    undefined,
    {
      skip: status !== "authenticated",
    },
  );

  const [saveInvoiceSettings, { isLoading: isSaving }] =
    useSaveInvoiceSettingsMutation();

  const [formData, setFormData] = useState({
    shop_name: "",
    shop_address: "",
    name_authority: "",
    currency_id: "",
    watermark_type: "Logo",
    watermark_text: "",
    vat: "0",
    tax: "0",
    trade_license: "",
    web_address: "",
    sale_condition: "",
    purchase_condition: "",
    wholesale_condition: "",
    social_link: "",
    social_link2: "",
    social_link3: "",
    mobile_number: "",
    additional_mobile_number: "",
    email: "",
    addtional_email: "",
    first_code: "#F7941D",
    second_code: "#000000",
    slogan: "",
    shop_logo: "",
    sign_authority: "",
    privacy_policy: "",
    warranty_policy: "",
    returns_exchange_policy: "",
    shipping_policy: "",
    terms_condition: "",
  });

  // Initialize form data when invoice data is loaded
  useEffect(() => {
    if (invoiceData?.data) {
      const data = invoiceData.data;
      setFormData({
        shop_name: data.shop_name || "",
        shop_address: data.shop_address || "",
        name_authority: data.name_authority || "",
        currency_id: data.currency_id || "",
        watermark_type: data.watermark_type || "Logo",
        watermark_text: data.watermark_text || "",
        vat: data.vat || "0",
        tax: data.tax || "0",
        trade_license: data.trade_license || "",
        web_address: data.web_address || "",
        sale_condition: data.sale_condition || "",
        purchase_condition: data.purchase_condition || "",
        wholesale_condition: data.wholesale_condition || "",
        social_link: data.social_link || "",
        social_link2: data.social_link2 || "",
        social_link3: data.social_link3 || "",
        mobile_number: data.mobile_number || "",
        additional_mobile_number: data.additional_mobile_number || "",
        email: data.email || "",
        addtional_email: data.addtional_email || "",
        first_code: data.first_code || "#F7941D",
        second_code: data.second_code || "#000000",
        slogan: data.slogan || "",
        shop_logo: data.shop_logo || "",
        sign_authority: data.sign_authority || "",
        privacy_policy: data.privacy_policy || "",
        warranty_policy: data.warranty_policy || "",
        returns_exchange_policy: data.returns_exchange_policy || "",
        shipping_policy: data.shipping_policy || "",
        terms_condition: data.terms_condition || "",
      });
    }
  }, [invoiceData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (type, file) => {
    const image = URL.createObjectURL(file);
    setImagePreview((prev) => ({
      ...prev,
      [type]: image,
    }));

    if (type === "shop_logo") {
      setShopLogoFile(file);
    } else if (type === "sign_authority") {
      setSignAuthorityFile(file);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const handleSave = async () => {
    if (!session?.accessToken) {
      toast.error("Authentication required");
      return;
    }

    toast.loading("Updating Invoice Settings...");

    try {
      let shop_logo = formData.shop_logo;
      let sign_authority = formData.sign_authority;

      // Upload shop logo if a new one is selected
      if (imagePreview.shop_logo) {
        try {
          const res = await dispatch(
            imageUpload({
              image: shopLogoFile,
              token: session.accessToken,
            }),
          ).unwrap();
          shop_logo = res;
          await sleep(300);
        } catch (imageError) {
          console.error("Shop logo upload failed:", imageError);
          toast.dismiss();
          toast.error("Failed to upload shop logo");
          return;
        }
      }

      // Upload sign authority if a new one is selected
      if (imagePreview.sign_authority) {
        try {
          const res = await dispatch(
            imageUpload({
              image: signAuthorityFile,
              token: session.accessToken,
            }),
          ).unwrap();
          sign_authority = res;
        } catch (imageError) {
          console.error("Sign authority upload failed:", imageError);
          toast.dismiss();
          toast.error("Failed to upload signature");
          return;
        }
      }

      // Prepare the complete payload
      const payload = {
        ...invoiceData.data,
        ...formData,
        shop_logo,
        sign_authority,
      };
      console.log(payload);
      console.log(shop_logo, sign_authority);
      const response = await saveInvoiceSettings(payload).unwrap();

      if (response.success) {
        toast.dismiss();
        toast.success("Invoice settings updated successfully!");
        setIsEditing(false);
        dispatch(resetPreview());
        setShopLogoFile(null);
        setSignAuthorityFile(null);
        setImagePreview((prev) => ({
          ...prev,
          shop_logo: "",
        }));
        setImagePreview((prev) => ({
          ...prev,
          sign_authority: "",
        }));
        updateSession({
          ...session,
          user: {
            ...session.user,
            invoice_settings: {
              ...session.user.invoice_settings,
              ...formData,
              shop_logo,
              sign_authority,
            },
          },
        });
      } else {
        toast.dismiss();
        toast.error(response.message || "Failed to update invoice settings");
      }
    } catch (error) {
      console.error("Invoice settings update error:", error);
      toast.dismiss();
      toast.error("An error occurred while updating invoice settings");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    dispatch(resetPreview());
    setShopLogoFile(null);
    setSignAuthorityFile(null);
    // Reset form data to original values
    if (invoiceData?.data) {
      const data = invoiceData.data;
      setFormData({
        shop_name: data.shop_name || "",
        shop_address: data.shop_address || "",
        name_authority: data.name_authority || "",
        currency_id: data.currency_id || "",
        watermark_type: data.watermark_type || "Logo",
        watermark_text: data.watermark_text || "",
        vat: data.vat || "0",
        tax: data.tax || "0",
        trade_license: data.trade_license || "",
        web_address: data.web_address || "",
        sale_condition: data.sale_condition || "",
        purchase_condition: data.purchase_condition || "",
        wholesale_condition: data.wholesale_condition || "",
        social_link: data.social_link || "",
        social_link2: data.social_link2 || "",
        social_link3: data.social_link3 || "",
        mobile_number: data.mobile_number || "",
        additional_mobile_number: data.additional_mobile_number || "",
        email: data.email || "",
        addtional_email: data.addtional_email || "",
        first_code: data.first_code || "#F7941D",
        second_code: data.second_code || "#000000",
        slogan: data.slogan || "",
        shop_logo: data.shop_logo || "",
        sign_authority: data.sign_authority || "",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Invoice Settings
          </CardTitle>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Settings"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {!isEditing ? (
          // Display Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Shop Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Shop Name:</span>{" "}
                    {formData.shop_name}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {formData.shop_address}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {formData.mobile_number}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Authority Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Authority Name:</span>{" "}
                    {formData.name_authority}
                  </p>
                  <p>
                    <span className="font-medium">VAT:</span> {formData.vat}%
                  </p>
                  <p>
                    <span className="font-medium">Tax:</span> {formData.tax}%
                  </p>
                  <p>
                    <span className="font-medium">Website:</span>{" "}
                    {formData.web_address}
                  </p>
                </div>
              </div>
            </div>

            {formData.shop_logo && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Shop Logo</h3>
                <img
                  src={formData.shop_logo || "/placeholder.svg"}
                  alt="Shop Logo"
                  className="w-24 h-24 object-contain border rounded"
                />
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  value={formData.shop_name}
                  onChange={(e) =>
                    handleInputChange("shop_name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.mobile_number}
                  onChange={(e) =>
                    handleInputChange("mobile_number", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="additional-phone">
                  Additional Mobile Number
                </Label>
                <Input
                  id="additional-phone"
                  value={formData.additional_mobile_number}
                  onChange={(e) =>
                    handleInputChange(
                      "additional_mobile_number",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="additional-email">
                  Additional Email Address
                </Label>
                <Input
                  id="additional-email"
                  type="email"
                  value={formData.addtional_email}
                  onChange={(e) =>
                    handleInputChange("addtional_email", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="web-address">Web Address</Label>
                <Input
                  id="web-address"
                  type="url"
                  value={formData.web_address}
                  onChange={(e) =>
                    handleInputChange("web_address", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="shop-address">Shop Address</Label>
              <Textarea
                id="shop-address"
                value={formData.shop_address}
                onChange={(e) =>
                  handleInputChange("shop_address", e.target.value)
                }
                rows={3}
              />
            </div>

            {/* Authority and Watermark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authority-name">Authority Name</Label>
                <Input
                  id="authority-name"
                  value={formData.name_authority}
                  onChange={(e) =>
                    handleInputChange("name_authority", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="watermark">Watermark</Label>
                <Input
                  id="watermark"
                  value={formData.watermark_text}
                  onChange={(e) =>
                    handleInputChange("watermark_text", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Branding Colors and Slogan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-code">Primary Color</Label>
                <Input
                  id="first-code"
                  type="color"
                  value={formData.first_code}
                  onChange={(e) =>
                    handleInputChange("first_code", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="second-code">Secondary Color</Label>
                <Input
                  id="second-code"
                  type="color"
                  value={formData.second_code}
                  onChange={(e) =>
                    handleInputChange("second_code", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => handleInputChange("slogan", e.target.value)}
                  placeholder="Your brand slogan"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_link}
                    onChange={(e) =>
                      handleInputChange("social_link", e.target.value)
                    }
                    placeholder="Facebook URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.social_link2}
                    onChange={(e) =>
                      handleInputChange("social_link2", e.target.value)
                    }
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_link3}
                    onChange={(e) =>
                      handleInputChange("social_link3", e.target.value)
                    }
                    placeholder="Instagram URL"
                  />
                </div>
              </div>
            </div>

            {/* VAT and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat">VAT in Percentage</Label>
                <Input
                  id="vat"
                  type="number"
                  value={formData.vat}
                  onChange={(e) => handleInputChange("vat", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Tax in Percentage</Label>
                <Input
                  id="tax"
                  type="number"
                  value={formData.tax}
                  onChange={(e) => handleInputChange("tax", e.target.value)}
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Terms & Conditions</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sale-condition">Sale Condition</Label>
                  <Textarea
                    id="sale-condition"
                    value={formData.sale_condition}
                    onChange={(e) =>
                      handleInputChange("sale_condition", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-condition">Purchase Condition</Label>
                  <Textarea
                    id="purchase-condition"
                    value={formData.purchase_condition}
                    onChange={(e) =>
                      handleInputChange("purchase_condition", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wholesale-condition">
                    Wholesale Condition
                  </Label>
                  <Textarea
                    id="wholesale-condition"
                    value={formData.wholesale_condition}
                    onChange={(e) =>
                      handleInputChange("wholesale_condition", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Shop Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview.shop_logo || formData.shop_logo ? (
                    <div className="space-y-2">
                      <img
                        src={
                          imagePreview.shop_logo ||
                          formData.shop_logo ||
                          "/placeholder.svg"
                        }
                        alt="Shop Logo"
                        className="w-20 h-20 object-contain mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => shopLogoInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => shopLogoInputRef.current?.click()}
                      >
                        Upload Shop Logo
                      </Button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={shopLogoInputRef}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload("shop_logo", file);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sign Authority</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview.sign_authority || formData.sign_authority ? (
                    <div className="space-y-2">
                      <img
                        src={
                          imagePreview.sign_authority ||
                          formData.sign_authority ||
                          "/placeholder.svg"
                        }
                        alt="Sign Authority"
                        className="w-20 h-20 object-contain mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => signAuthorityInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Signature
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => signAuthorityInputRef.current?.click()}
                      >
                        Upload Signature
                      </Button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={signAuthorityInputRef}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload("sign_authority", file);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 underline">
                Policy & Legal Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Privacy Policy</Label>
                  <ReactQuill
                    className="w-full"
                    theme="snow"
                    value={formData.privacy_policy}
                    onChange={(value) =>
                      handleInputChange("privacy_policy", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Warranty Policy</Label>
                  <ReactQuill
                    className="w-full"
                    theme="snow"
                    value={formData.warranty_policy}
                    onChange={(value) =>
                      handleInputChange("warranty_policy", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Returns & Exchange Policy</Label>
                  <ReactQuill
                    className="w-full"
                    theme="snow"
                    value={formData.returns_exchange_policy}
                    onChange={(value) =>
                      handleInputChange("returns_exchange_policy", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shipping Policy</Label>
                  <ReactQuill
                    className="w-full"
                    theme="snow"
                    value={formData.shipping_policy}
                    onChange={(value) =>
                      handleInputChange("shipping_policy", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <ReactQuill
                    className="w-full"
                    theme="snow"
                    value={formData.terms_condition}
                    onChange={(value) =>
                      handleInputChange("terms_condition", value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Discard Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceSettingsForm;
