"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Plus,
  Images,
  Upload,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditBannerUi({ banners, onRemove, onUpdate }) {
  const [images, setImages] = useState([]);
  const [editableBanner, setEditableBanner] = useState(banners || []);

  useEffect(() => {
    if (banners) {
      setEditableBanner(banners);
    }
  }, [banners]);

  const removeBanner = (id) => {
    toast("Delete?", {
      description: () => (
        <div>
          <p className="text-lg">Are you sure?</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              onClick={async () => {
                await onRemove.mutate(id);
                toast.dismiss();
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => toast.dismiss()}
            >
              No
            </button>
          </div>
        </div>
      ),
      duration: Infinity, // keep it open until user chooses
    });
  };

  const updateBanner = (bannerId, updates) => {
    setEditableBanner((prev) =>
      prev.map((banner) =>
        banner.id === bannerId ? { ...banner, ...updates } : banner
      )
    );
  };

  const handleImageUpload = (bannerId, event) => {
    const file = event.target?.files[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      updateBanner(bannerId, { image_path: file, preview, isVideo });
      setImages([...images, { [bannerId]: file }]);
    }
  };

  const handleSaveBanners = async (banner) => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(banner).forEach(([key, value]) => {
      if (key === "preview") return;
      else if (key === "image_path" && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      await onUpdate(banner.id, formData);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Helper for safe video condition
  const isVideoFile = (banner) =>
    banner.isVideo ||
    (typeof banner.image_path === "string" &&
      banner.image_path.match(/\.(mp4|mov|webm)$/i));

  const activeBanners =
    editableBanner && editableBanner?.length
      ? editableBanner.filter((banner) => banner.status)
      : [];

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Create Banner">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Banner Manager
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Create and manage unlimited banners for your website.
              </p>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Banner Preview
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="create-banner">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Banner
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Banner Grid Display */}
              {activeBanners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <div className="relative h-48 flex items-center justify-center">
                        {isVideoFile(banner) ? (
                          <video
                            src={banner.preview || banner.image_path}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={banner.preview || banner.image_path}
                            alt={banner.title || "preview"}
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                          <div className="p-4 text-white w-full">
                            <h3 className="text-lg font-bold mb-2 text-balance">
                              {banner.title}
                            </h3>
                            {banner.button_text && (
                              <a
                                href={banner.button_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 rounded-md text-sm font-semibold"
                                style={{
                                  backgroundColor:
                                    banner.background_color || "#ffffff",
                                  color: "#000",
                                }}
                              >
                                {banner.button_text}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-10">
                  No Active Banners
                </p>
              )}
            </CardContent>
          </Card>

          {/* Banner Management */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Images className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Banner Management
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Banner List */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {editableBanner.map((banner) => (
                  <Card
                    key={banner.id}
                    className="transition-all duration-200 hover:shadow-lg border-slate-200 bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-12 gap-6 items-start">
                        {/* Image/Video Preview */}
                        <div className="col-span-3">
                          <div className="relative group h-24">
                            {isVideoFile(banner) ? (
                              <video
                                src={banner.preview || banner.image_path}
                                controls
                                className="w-full h-full rounded-lg border-2 border-slate-200 object-cover"
                              />
                            ) : (
                              <Image
                                src={banner.preview || banner.image_path}
                                alt={banner.title || "preview"}
                                fill
                                className="object-cover rounded-lg border-2 border-slate-200"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors"></div>
                          </div>
                        </div>

                        {/* Banner Details */}
                        <div className="col-span-7 space-y-4">
                          <div className="space-y-2">
                            <Label>Banner Title</Label>
                            <Input
                              value={banner.title || ""}
                              onChange={(e) =>
                                updateBanner(banner.id, {
                                  title: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* New fields */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Button Text</Label>
                              <Input
                                value={banner.button_text || ""}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    button_text: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Button URL</Label>
                              <Input
                                value={banner.button_url || ""}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    button_url: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Background Color</Label>
                              <Input
                                type="color"
                                value={banner.background_color || "#ffffff"}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    background_color: e.target.value,
                                  })
                                }
                                className="h-10 cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* New Optional Fields */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="space-y-2">
                              <Label>Description (optional)</Label>
                              <Input
                                value={banner.description || ""}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Short description"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type (optional)</Label>
                              <Input
                                value={banner.type || ""}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    type: e.target.value,
                                  })
                                }
                                placeholder="Type e.g. hero / seasonal"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Media Upload</Label>
                            <Input
                              type="file"
                              accept=".jpeg,.png,.jpg,.gif,.webp,.mp4,.mov,.webm"
                              onChange={(e) => handleImageUpload(banner.id, e)}
                            />
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="col-span-2 flex flex-col items-end gap-4">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={!!banner.status}
                              onCheckedChange={(checked) =>
                                updateBanner(banner.id, {
                                  status: checked ? 1 : 0,
                                })
                              }
                            />
                            {banner.status ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Eye className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  Visible
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400">
                                <EyeOff className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  Hidden
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBanner(banner.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="w-full flex justify-center mt-4">
                        <button
                          onClick={() => handleSaveBanners(banner)}
                          className="bg-blue-500 text-white px-5 py-2 font-semibold rounded-xl"
                        >
                          Save Changes
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
