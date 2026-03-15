"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sketch } from "@uiw/react-color";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export default function VariationFormEdit({ item, onClose, onSubmit }) {
  const initial = useMemo(
    () => ({
      serial: item?.imei_form?.serial || "",
      original_serial: item?.imei_form?.original_serial || "",
      purchase_price:
        item?.imei_form?.purchase_price ?? Number(item?.price || 0),
      sale_price: item?.imei_form?.sale_price ?? 0,
      wholesale_price: item?.imei_form?.wholesale_price ?? 0,
      last_price: item?.imei_form?.last_price ?? 0,
      color: item?.imei_form?.color || "",
      color_code: item?.imei_form?.color_code || "",
      storage: item?.imei_form?.storage || "",
      battery_life: item?.imei_form?.battery_life || "",
      model: item?.imei_form?.model || "",
      warranty: item?.imei_form?.warranty || "",
      region: item?.imei_form?.region || "",
      image_path: item?.imei_form?.image_path || "",
      product_condition: item?.imei_form?.product_condition || "",
      box_status: item?.imei_form?.box_status || "",
      note: item?.imei_form?.note || "",
    }),
    [item],
  );

  const [form, setForm] = useState(initial);
  const [hex, setHex] = useState(form.color_code || "");
  const [fileName, setFileName] = useState("");

  // Removed imeiCheck mutation because checking if IMEI is available is only appropriate for sales, not purchases.

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file_name", file);

    try {
      const res = await api.post("/file-upload", formData);
      if (res.status === 200) {
        setForm((prev) => ({ ...prev, image_path: res.data.path || "" }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.[0] || "Image upload failed");
    }
  };

  const handleDone = async () => {

    const updated = {
      ...form,
      purchase_price: Number(form.purchase_price) || 0,
      sale_price: Number(form.sale_price) || 0,
      wholesale_price: Number(form.wholesale_price) || 0,
      last_price: Number(form.last_price) || 0,
      color_code: hex || form.color_code || "",
    };

    onSubmit?.(updated);
    onClose?.();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div>
          <Label>Region</Label>
          <Input
            value={form.region}
            onChange={(e) => handleChange("region", e.target.value)}
            placeholder="Region"
          />
        </div>
        <div>
          <Label>SL/IMEI</Label>
          <Input
            value={form.serial}
            onChange={(e) => handleChange("serial", e.target.value)}
            placeholder="EX: 123456"
          />
        </div>
        <div>
          <Label>Purchase Price</Label>
          <Input
            type="number"
            value={form.purchase_price}
            onChange={(e) => handleChange("purchase_price", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Wholesale Price</Label>
          <Input
            type="number"
            value={form.wholesale_price}
            onChange={(e) => handleChange("wholesale_price", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Sale Price</Label>
          <Input
            type="number"
            value={form.sale_price}
            onChange={(e) => handleChange("sale_price", e.target.value)}
            placeholder="0.00"
          />
        </div>
        +{" "}
        <div>
          <Label>Last Price</Label>
          <Input
            type="number"
            value={form.last_price || ""}
            onChange={(e) => handleChange("last_price", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Qty</Label>
          <Input value={1} readOnly />
        </div>
        <div>
          <Label>Color</Label>
          <Input
            value={form.color}
            onChange={(e) => handleChange("color", e.target.value)}
            placeholder="color"
          />
        </div>
        <div>
          <Label>Storage</Label>
          <Input
            value={form.storage}
            onChange={(e) => handleChange("storage", e.target.value)}
            placeholder="storage"
          />
        </div>
        <div>
          <Label>Battery Life</Label>
          <Input
            value={form.battery_life}
            onChange={(e) => handleChange("battery_life", e.target.value)}
            placeholder="Battery Life"
          />
        </div>
        <div>
          <Label>Model</Label>
          <Input
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="Model"
          />
        </div>
        <div>
          <Label>Warranty</Label>
          <Input
            value={form.warranty}
            onChange={(e) => handleChange("warranty", e.target.value)}
            placeholder="Warranty"
          />
        </div>
        <div className="relative">
          <Label>Upload Image</Label>
          <Input
            type="file"
            accept=".jpeg,.jpg,.png"
            onChange={handleImageUpload}
          />
          {fileName ? (
            <p className="bg-white w-[60%] z-10 absolute top-[30px] right-[11px] text-ellipsis line-clamp-1 text-sm">
              {fileName}
            </p>
          ) : null}
        </div>
        <div>
          <Label>Product Condition</Label>
          <Select
            value={form.product_condition || ""}
            onValueChange={(value) => handleChange("product_condition", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Box Status</Label>
          <Select
            value={form.box_status || ""}
            onValueChange={(value) => handleChange("box_status", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="with box">With Box</SelectItem>
                <SelectItem value="without box">Without Box</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <Label>Color Code</Label>
          <div className="flex items-start gap-4">
            <div>
              <Sketch
                style={{ marginLeft: 20 }}
                color={hex}
                onChange={(color) => {
                  setHex(color.hex);
                  handleChange("color_code", color.hex);
                }}
                className="mt-2"
              />
            </div>
            <div className="flex-1">
              <Input className="mt-2 w-full" value={hex} readOnly />
            </div>
          </div>
        </div>
        <div className="col-span-1 sm:col-span-1 lg:col-span-2">
          <Label>Note</Label>
          <Input
            value={form.note || ""}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Optional note for this IMEI / variation"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleDone} className="bg-blue-500 text-white">
          Done
        </Button>
      </div>
    </div >
  );
}
