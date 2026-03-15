"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Images,
  Upload,
  Eye,
  EyeOff,
  Link2,
} from "lucide-react";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const SelectProducts = dynamic(() => import("./SelectProducts"), {
  ssr: false,
});

export default function CarouselSlider() {
  const [carousel, setCarousel] = useState({
    sliders: [],
  });

  const [configuration, setConfiguration] = useState({
    currentSlide: 0,
    autoPlay: 0,
    autoPlayInterval: "3000",
  });

  const [images, setImages] = useState([]);

  const addSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: "New Slide",
      link: "",
      image_path: "/new-slide-content.jpg",
      status: 1,
      product_id: "",
    };

    setCarousel({
      ...carousel,
      sliders: [...carousel.sliders, newSlide],
    });
  };

  const removeSlide = (slideId) => {
    const updatedSlides = carousel.sliders.filter(
      (slide) => slide.id !== slideId
    );
    setCarousel({
      ...carousel,
      sliders: updatedSlides,
    });
  };

  const updateSlide = (slideId, updates) => {
    setCarousel({
      ...carousel,
      sliders: carousel.sliders.map((slide) =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      ),
    });
  };

  const nextSlide = () => {
    const activeSlides = carousel.sliders.filter((slide) => slide.status);
    if (activeSlides.length > 0) {
      const nextIndex =
        (configuration.currentSlide + 1) % carousel.sliders.length;
      setConfiguration((prev) => ({
        ...prev,
        currentSlide: nextIndex,
      }));
    }
  };

  const prevSlide = () => {
    const activeSlides = carousel.sliders.filter((slide) => slide.status);
    if (activeSlides.length > 0) {
      const prevIndex =
        configuration.currentSlide === 0
          ? carousel.sliders.length - 1
          : configuration.currentSlide - 1;
      setConfiguration((prev) => ({
        ...prev,
        currentSlide: prevIndex,
      }));
    }
  };

  const goToSlide = (slideIndex) => {
    setConfiguration((prev) => ({
      ...prev,
      currentSlide: slideIndex,
    }));
  };

  const handleImageUpload = (slideId, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      updateSlide(slideId, { image_path: file, preview });
      setImages([...images, { [slideId]: file }]);
    }
  };

  const handleSaveSliders = async () => {
    if (!carousel.sliders.length) {
      toast.error("Add slider first");
      return;
    }
    const formData = new FormData();
    const { sliders, ...rest } = carousel;

    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, value);
    });

    sliders.forEach((slider, idx) => {
      const { id, preview, currentSlide, autoPlay, autoPlayInterval, ...rest } =
        slider;

      Object.entries(rest).forEach(([key, value]) => {
        if (
          key === "currentSlide" ||
          key === "autoPlay" ||
          key === "autoPlayInterval"
        )
          return;
        if (key === "image_path" && value instanceof File) {
          formData.append(`${idx}[image_path]`, value);
        } else {
          formData.append(`${idx}[${key}]`, value);
        }
      });
    });

    try {
      const res = await api.post(`/new/save-sliders`, formData);
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

  const activeSlides = carousel.sliders.filter((slide) => slide.status);

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Create Slider">
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
                  Carousel Configuration
                </CardTitle>
                <div className="flex items-center gap-5">
                  <Link href="sliders">
                    <Button
                      onClick={addSlide}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Sliders
                    </Button>
                  </Link>
                  <Button
                    onClick={addSlide}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Carousel Display */}
              <div className="relative bg-muted/30 rounded-lg overflow-hidden">
                {activeSlides.length > 0 ? (
                  <>
                    <div className="relative h-80 flex items-center justify-center">
                      <img
                        src={
                          carousel.sliders[configuration.currentSlide]
                            ?.preview || "/placeholder.svg"
                        }
                        alt={
                          carousel.sliders[configuration.currentSlide]?.title ||
                          "Slide"
                        }
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-3xl font-bold mb-4">
                            {
                              carousel.sliders[configuration.currentSlide]
                                ?.title
                            }
                          </h3>
                          {carousel.sliders[configuration.currentSlide]
                            ?.link && (
                            <Link
                              href={
                                carousel.sliders[configuration.currentSlide]
                                  .link
                              }
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
                    </div>

                    {/* Navigation Controls */}
                    {activeSlides.length > 1 && (
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
                    {activeSlides.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {carousel.sliders.map(
                          (slide, index) =>
                            slide.status && (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                  index === carousel.currentSlide
                                    ? "bg-white"
                                    : "bg-white/50 hover:bg-white/75"
                                }`}
                              />
                            )
                        )}
                      </div>
                    )}
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
              </div>

              {/* Carousel Settings */}
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

              {/* Slide Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Manage Slides</Label>
                  <span className="text-sm text-muted-foreground">
                    {carousel.sliders.length} total • {activeSlides.length}{" "}
                    active
                  </span>
                </div>

                {/* Slide List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {carousel.sliders.map((slide, index) => (
                    <Card
                      key={slide.id}
                      className={`transition-all ${
                        index === carousel.currentSlide && slide.status
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
                            <img
                              src={slide.preview || "/placeholder.svg"}
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
                                  updateSlide(slide.id, {
                                    title: e.target.value,
                                  })
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
                                value={slide.link}
                                onChange={(e) =>
                                  updateSlide(slide.id, {
                                    link: e.target.value,
                                  })
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
                                    handleImageUpload(slide.id, e)
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
                              />
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="col-span-2 flex flex-col items-end gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={slide.status == 1}
                                onCheckedChange={(checked) =>
                                  updateSlide(slide.id, {
                                    status: checked ? 1 : 0,
                                  })
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {carousel.sliders.length === 0 ? (
                <div className="text-center py-8">
                  <Images className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No slides yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first slide to get started
                  </p>
                  <Button
                    onClick={addSlide}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Slide
                  </Button>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <button
                    onClick={handleSaveSliders}
                    className="bg-blue-500 text-white px-5 py-2 font-semibold rounded-xl"
                  >
                    Save Sliders
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
