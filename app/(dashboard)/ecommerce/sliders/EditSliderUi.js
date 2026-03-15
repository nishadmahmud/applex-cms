"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Images,
  Link2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import React, { use, useState } from "react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { toast } from "sonner";
import { handleRemoveSlider } from "@/lib/actions";
import ProtectedRoute from "@/components/ProtectedRoute";
const SelectProducts = dynamic(
  () => import("../create-slider/SelectProducts"),
  { ssr: false }
);

export default function EditSliderUi({ data }) {
  const sliders = use(data);
  const [configuration, setConfiguration] = useState({
    currentSlide: 0,
    autoPlay: 0,
    autoPlayInterval: "3000",
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [editableSliders, setEditableSliders] = useState(
    sliders?.sliders || []
  );
  const [preview, setPreview] = useState({});

  const nextSlide = () => {
    if (editableSliders.length - 1 > activeIndex) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handleImageUpload = (id, e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview((prev) => ({
      ...prev,
      [index]: url,
    }));

    updateSlide("image_path", file, id);
  };

  const prevSlide = () => {
    if (sliders?.sliders?.length && activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const updateSlide = async (field, value, id) => {
    setEditableSliders((prev) =>
      prev.map((slide) =>
        slide.id == id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const handleSaveSliders = async (slide) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(slide).forEach(([key, value]) => {
      if (key === "image_path") {
        if (Array.isArray(value)) {
          value.forEach((file, index) => {
            if (file instanceof File) {
              formData.append(`image_path`, file);
            }
          });
        } else if (value instanceof File) {
          formData.append("image_path", value);
        }
      } else if (key === "product_id") {
        formData.append("product_id", value);
      } else if (key === "link" && value === null) {
        formData.append("link", "");
      } else {
        formData.append(key, value);
      }
    });

    try {
      const res = await api.post(`/new/update-sliders/${slide.id}`, formData);
      await api.post("/slider-settings", configuration);
      toast.success(res.data.message);
    } catch (error) {
      if (error?.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError);
      } else {
        toast.error("Something Went Wrong");
      }
    }
  };

  const removeSlide = (id) => {
    toast("Delete?", {
      description: () => (
        <div>
          <p className="text-lg">Are you sure?</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={async () => {
                const res = await handleRemoveSlider(id);
                if (res.success) {
                  setEditableSliders((prev) =>
                    prev.filter((item) => item.id != id)
                  );
                }
                toast.success("Deleted Successfully");
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => toast.dismiss()} // 👉 dismiss only
            >
              No
            </button>
          </div>
        </div>
      ),
      duration: Infinity, // keep it open until user chooses
    });
  };

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Create Sliders">
      <div className="min-h-screen bg-background p-6">
        <div className=" mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Carousel Slider Interface
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create and customize your carousel slider with unlimited slides.
              Add images, links, and control visibility.
            </p>
          </div>

          <Card className="bg-card border-border shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-card-foreground">
                  Edit Carousel Configuration
                </CardTitle>
                <div className="flex items-center gap-5">
                  <Link href="create-slider">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slide
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="relative bg-muted/30 rounded-lg overflow-hidden">
                {editableSliders && editableSliders?.length > 0 ? (
                  <>
                    <div className="relative h-80 flex items-center justify-center">
                      <Image
                        width={200}
                        height={200}
                        src={
                          preview[activeIndex] ||
                          editableSliders[activeIndex]?.image_path
                        }
                        alt={editableSliders[activeIndex]?.title || "Slide"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-3xl font-bold mb-4">
                            {editableSliders[activeIndex]?.title}
                          </h3>
                          {editableSliders[activeIndex]?.link && (
                            <Link
                              href={editableSliders[activeIndex].link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Learn More
                            </Link>
                          )}
                        </div>
                      </div>
                      {/* Navigation Controls */}
                      {editableSliders.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black shadow-lg"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black shadow-lg"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </>
                      )}

                      {/* Slide Indicators */}
                      {editableSliders.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {sliders.sliders.map(
                            (slide, index) =>
                              slide.status && (
                                <button
                                  key={index}
                                  onClick={() => setActiveIndex(index)}
                                  className={`w-3 h-3 rounded-full transition-all ${
                                    index === activeIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/75"
                                  }`}
                                />
                              )
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Images className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No active slides</p>
                      <p className="text-sm">
                        Add slides or enable existing ones to see your carousel
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Auto Play</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={configuration.autoPlay}
                        onCheckedChange={(checked) =>
                          setConfiguration((prev) => ({
                            ...prev,
                            autoPlay: checked ? 1 : 0,
                          }))
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {configuration.autoPlay ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval" className="text-sm font-medium">
                      Interval (ms)
                    </Label>
                    <Input
                      id="interval"
                      type="text"
                      value={configuration.autoPlayInterval}
                      onChange={(e) =>
                        setConfiguration((prev) => ({
                          ...prev,
                          autoPlayInterval: e.target.value,
                        }))
                      }
                      className="h-9"
                      disabled={!configuration.autoPlay}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">
                      Manage Slides
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {sliders?.sliders?.length} total • active
                    </span>
                    {/* {activeSlides.length} */}
                  </div>

                  {/* Slide List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {editableSliders.map((slide, index) => (
                      <Card
                        key={slide.id}
                        className={`transition-all ${
                          index === activeIndex && slide.status
                            ? "border-blue-500 bg-blue-50"
                            : slide.status
                            ? "border-border hover:border-blue-300"
                            : "border-border bg-muted/50 opacity-75"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="grid grid-cols-12 gap-4 items-start">
                            {/* Image Preview */}
                            <div className="col-span-2">
                              <Image
                                width={200}
                                height={200}
                                src={
                                  preview[index] ||
                                  editableSliders[index].image_path
                                }
                                alt={slide.title}
                                className="w-full h-16 object-cover rounded border"
                              />
                            </div>

                            {/* Slide Details */}
                            <div className="col-span-8 space-y-3">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Title
                                </Label>
                                <Input
                                  value={slide.title}
                                  onChange={(e) =>
                                    updateSlide(
                                      "title",
                                      e.target.value,
                                      slide.id
                                    )
                                  }
                                  className="h-8"
                                  placeholder="Enter slide title"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Link URL
                                </Label>
                                <Input
                                  value={!slide.link ? "" : slide.link}
                                  onChange={(e) =>
                                    updateSlide(
                                      "link",
                                      e.target.value,
                                      slide.id
                                    )
                                  }
                                  className="h-8"
                                  placeholder="https://example.com"
                                  type="url"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Image Upload
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept=".jpeg,.png,.jpg,.gif,.webp"
                                    onChange={(e) =>
                                      handleImageUpload(slide.id, e, index)
                                    }
                                    className="h-8 text-xs"
                                  />
                                  <Upload className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Supported: JPEG, PNG, JPG, GIF, WebP • Lower
                                  image size = better website speed
                                </p>
                              </div>

                              <div>
                                <SelectProducts
                                  updateSlide={updateSlide}
                                  id={slide.id}
                                  action={"edit"}
                                  selectedProduct={slide.product_id}
                                />
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="col-span-2 flex flex-col items-end gap-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={slide.status == 1}
                                  onCheckedChange={(checked) =>
                                    updateSlide(
                                      "status",
                                      checked ? 1 : 0,
                                      slide.id
                                    )
                                  }
                                />
                                {slide.status ? (
                                  <Eye className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSlide(slide.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="w-full flex justify-center">
                            <button
                              onClick={() => handleSaveSliders(slide)}
                              className="bg-blue-500 text-white px-5 py-2 font-semibold rounded-xl mt-5"
                            >
                              Save Changes
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
