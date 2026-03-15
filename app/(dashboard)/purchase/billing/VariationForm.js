"use client";
import {
  setActiveIndex,
  setSameInfo,
  updateVariants,
} from "@/app/store/pos/variationSlice";
import Modal from "@/app/utils/Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Sketch } from "@uiw/react-color";
import { LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// eslint-disable-next-line react/prop-types
export default function VariationForm({
  id,
  onClose,
  setSameForAll,
  sameForAll,
  onSubtotalUpdate,
}) {
  const [files, setFiles] = useState({});
  const dispatch = useDispatch();
  const product = useSelector((state) => state.variations.products[id]);
  const activeIndex = product.activeIndex;
  const variant = product.variants.length ? product.variants[activeIndex] : {};
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [hex, setHex] = useState("");
  useEffect(() => {
    if (variant?.color_code) {
      setHex(variant.color_code);
    }
  }, [variant?.color_code]);

  // Removed imeiCheck because we don't need to check availability during a new purchase.
  const handleChange = (field, value, index) => {
    dispatch(updateVariants({ field, value, index, id }));
  };

  const handleNext = async () => {
    if (activeIndex < product.variants.length - 1) {
      dispatch(setActiveIndex({ id, index: activeIndex + 1 }));
    }
  };
  const handlePrev = () => {
    if (activeIndex > 0) {
      dispatch(setActiveIndex({ id, index: activeIndex - 1 }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setFiles((prev) => ({
      ...prev,
      [activeIndex]: file,
    }));
    const formData = new FormData();
    formData.append("file_name", file);
    try {
      const res = await api.post("/file-upload", formData);
      if (res.status === 200) {
        dispatch(
          updateVariants({
            field: "image_path",
            value: res.data.path,
            index: activeIndex,
            id,
          }),
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.data[0]);
    }
  };
  const handleClose = async () => {
    const checkImeis = product.variants.filter((item) => Boolean(item.serial));
    if (checkImeis.length !== product.variants.length) {
      toast.error("Imei number must be provided in variation");
      return;
    }

    // 🔹 Sum of purchase_price for all variants
    const totalPurchasePrice = product.variants.reduce(
      (sum, v) => sum + Number(v.purchase_price || 0),
      0,
    );
    const imeiCount = product.variants.length;

    // 🔹 Notify parent (OrderList) if callback provided
    if (typeof onSubtotalUpdate === "function") {
      onSubtotalUpdate(totalPurchasePrice, imeiCount);
    }

    onClose();
  };

  const renderNavButtons = () => {
    const pending = false;
    if (product.variants.length > 1 && activeIndex === 0) {
      return (
        <div className="flex justify-between gap-2">
          <Button
            onClick={handleNext}
            disabled={pending}
            className="bg-blue-500 flex-1 text-white"
          >
            {pending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      );
    } else if (product.variants.length - 1 > activeIndex) {
      return (
        <div className="flex justify-between gap-2">
          <Button
            onClick={handlePrev}
            disabled={pending}
            className="bg-blue-500 flex-1 text-white"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={pending}
            className="bg-blue-500 flex-1 text-white"
          >
            {pending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Next"
            )}
          </Button>
        </div>
      );
    } else if (
      product.variants.length > 1 &&
      product.variants.length - 1 === activeIndex
    ) {
      return (
        <div className="flex justify-between gap-2">
          <Button
            onClick={handlePrev}
            disabled={pending}
            className="bg-blue-500 flex-1 text-white"
          >
            Previous
          </Button>
          <Button
            onClick={handleClose}
            disabled={pending}
            className="bg-blue-500 flex-1 text-white"
          >
            {pending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Done"
            )}
          </Button>
        </div>
      );
    } else {
      return (
        <Button
          onClick={handleClose}
          disabled={pending}
          className="bg-blue-500 w-full text-white"
        >
          {pending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Done"
          )}
        </Button>
      );
    }
  };

  return (
    <div className="">
      <div className="mb-4">
        <Card className="w-full">
          <CardContent className="py-2 px-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex justify-start items-center gap-6">
                <div className="text-right">
                  <h2 className="text-lg font-semibold">
                    Variation {activeIndex + 1}
                  </h2>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center justify-center gap-2">
                  <Checkbox
                    id="same-for-all"
                    checked={sameForAll}
                    onCheckedChange={(value) => {
                      setSameForAll(value);
                      dispatch(setSameInfo({ id, sameForAll: value }));
                    }}
                  />
                  <Label htmlFor="same-for-all" className="text-sm font-medium">
                    Use same values for all variations
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    (When enabled, changes to the first variation will be
                    applied to all variations.)
                  </p>
                </div>
                <Separator orientation="vertical" className="h-6" />
              </div>

              <div className="flex items-center justify-end">
                {renderNavButtons()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {variant && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <Label>Region</Label>
              <Input
                name="region"
                value={variant?.region}
                onChange={(e) =>
                  handleChange("region", e.target.value, activeIndex)
                }
                placeholder="Region"
              />
            </div>
            <div>
              <Label>SL/IMEI</Label>
              <Input
                name="serial"
                value={variant?.serial}
                onChange={(e) =>
                  handleChange("serial", e.target.value, activeIndex)
                }
                placeholder="EX: 123456"
              />
            </div>
            <div>
              <Label>Purchase Price</Label>
              <Input
                name="purchase_price"
                value={variant?.purchase_price}
                onChange={(e) =>
                  handleChange("purchase_price", e.target.value, activeIndex)
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Wholesale Price</Label>
              <Input
                name="wholesale_price"
                value={variant?.wholesale_price}
                onChange={(e) =>
                  handleChange("wholesale_price", e.target.value, activeIndex)
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Sale Price</Label>
              <Input
                name="retails_price"
                value={variant?.retails_price}
                onChange={(e) =>
                  handleChange("retails_price", e.target.value, activeIndex)
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Last Price</Label>
              <Input
                name="last_price"
                value={variant?.last_price}
                onChange={(e) =>
                  handleChange("last_price", e.target.value, activeIndex)
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Qty</Label>
              <Input name="qty" defaultValue={1} readOnly />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                name="color"
                value={variant?.color}
                onChange={(e) =>
                  handleChange("color", e.target.value, activeIndex)
                }
                placeholder="color"
              />
            </div>
            <div>
              <Label>Storage</Label>
              <Input
                name="storage"
                value={variant?.storage}
                onChange={(e) =>
                  handleChange("storage", e.target.value, activeIndex)
                }
                placeholder="storage"
              />
            </div>
            <div>
              <Label>Battery Life</Label>
              <Input
                name="battery_life"
                value={variant?.battery_life}
                onChange={(e) =>
                  handleChange("battery_life", e.target.value, activeIndex)
                }
                placeholder="Battery Life"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                name="model"
                value={variant?.model}
                onChange={(e) =>
                  handleChange("model", e.target.value, activeIndex)
                }
                placeholder="Model"
              />
            </div>
            <div>
              <Label>Warranty</Label>
              <Input
                name="warranty"
                value={variant?.warranty}
                onChange={(e) =>
                  handleChange("warranty", e.target.value, activeIndex)
                }
                placeholder="Warranty"
              />
            </div>
            <div className="relative">
              <Label>Upload Image</Label>
              <Input
                type="file"
                key={`file-${activeIndex}`}
                accept=".jpeg,.jpg,.png"
                onChange={handleImageUpload}
              />
              {files[activeIndex]?.name ? (
                <p className="bg-white  w-[60%] z-10 absolute top-[30px]  right-[11px] text-ellipsis line-clamp-1 text-sm">
                  {files[activeIndex].name}
                </p>
              ) : (
                ""
              )}
            </div>
            <div>
              <Label>Product Condition</Label>
              <Select
                value={variant?.product_condition}
                onValueChange={(value) =>
                  handleChange("product_condition", value, activeIndex)
                }
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
                value={variant?.box_status}
                onValueChange={(value) =>
                  handleChange("box_status", value, activeIndex)
                }
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
            <div className="flex items-center gap-2">
              <Checkbox />
              <Label>Is Ecommerce</Label>
            </div>
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <Label htmlFor="color-code">Color Code</Label>
              <div className="flex items-center gap-3 mt-1">
                {/* ✅ Checkbox to open modal */}
                <Checkbox
                  id="color-code"
                  checked={colorModalOpen}
                  onCheckedChange={(checked) => {
                    if (checked) setColorModalOpen(true);
                    else setColorModalOpen(false);
                  }}
                />
                <Label
                  htmlFor="color-code"
                  className="text-sm cursor-pointer select-none text-gray-700"
                >
                  Pick color code
                </Label>

                {/* ✅ Display selected color (read-only) */}
                <Input className="flex-1" value={hex} readOnly />
              </div>

              {/* ✅ Use the global Modal component for Sketch */}
              <Modal
                title="Select Color"
                open={colorModalOpen}
                onClose={setColorModalOpen}
                content={
                  <div className="flex flex-col items-center">
                    {/* Limit width to match Sketch component visually */}
                    <div className="w-[220px] space-y-3">
                      <Sketch
                        color={hex}
                        onChange={(color) => {
                          setHex(color.hex);
                          dispatch(
                            updateVariants({
                              field: "color_code",
                              value: color.hex,
                              index: activeIndex,
                              id,
                            }),
                          );
                        }}
                      />
                      <Button
                        onClick={() => setColorModalOpen(false)}
                        className="w-full bg-blue-500 text-white"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                }
              />
            </div>
            {/* 🔹 NEW NOTE FIELD — take the other half */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <Label>Note</Label>
              <Input
                className="w-full"
                name="note"
                value={variant?.note || ""}
                onChange={(e) =>
                  handleChange("note", e.target.value, activeIndex)
                }
                placeholder="Optional note for this IMEI / variation"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
