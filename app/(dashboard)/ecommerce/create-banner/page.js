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
  Upload,
  ImageIcon,
  Images,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateBanner() {
  const [banners, setBanners] = useState([]); // for creating banner
  const [images, setImages] = useState([]);
  const [existingBannerCount, setExistingBannerCount] = useState({
    total: 0,
    active: 0,
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Fetch existing banners count from API
  useEffect(() => {
    const fetchExistingBanners = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await api.get(`/public/banners/${session.user.id}`);
        if (res.data?.success && Array.isArray(res.data.banners)) {
          const all = res.data.banners;
          const active = all.filter((b) => Number(b.status) === 1);
          setExistingBannerCount({
            total: all.length,
            active: active.length,
          });
        }
      } catch (error) {
        console.error("Error fetching existing banners:", error);
      }
    };
    fetchExistingBanners();
  }, [status, session]);

  // ✅ Add new banner
  const addBanner = () => {
    const newBanner = {
      id: `banner-${Date.now()}`,
      title: "",
      button_text: "",
      button_url: "",
      background_color: "#ffffff",
      image_path: "",
      status: 1,
      description: "", // new nullable field
      type: "", // new nullable field
    };
    setBanners([...banners, newBanner]);
  };

  // ✅ Update banner locally
  const updateBanner = (id, updates) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  // ✅ Remove banner block
  const removeBanner = (id) =>
    setBanners((prev) => prev.filter((b) => b.id !== id));

  // ✅ Handle file upload with preview
  const handleImageUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      updateBanner(id, { image_path: file, preview, isVideo });
      setImages([...images, { [id]: file }]);
    }
  };

  // ✅ Save banners -> show toast -> redirect to /banners
  const handleSaveBanners = async () => {
    const formData = new FormData();

    banners.forEach((banner, idx) => {
      Object.entries(banner).forEach(([key, value]) => {
        if (key === "id" || key === "preview") return;
        formData.append(`${idx}[${key}]`, value);
      });
    });

    try {
      const res = await api.post("/new/save-banners", formData);
      if (res.data.success) {
        toast.success(res.data.message || "Banners created successfully!");
        setTimeout(() => {
          router.push("/ecommerce/banners?refresh=true");
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save banners");
    }
  };

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Create Banner">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Banner Manager
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Create new banners for your website. Existing banners are shown
                in the Banners section.
              </p>
            </div>

            {/* ✅ Counts Section moved here */}
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{existingBannerCount.total} Total Banners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{existingBannerCount.active} Active</span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Create New Banner
                  </CardTitle>
                </div>

                <div className="flex items-center gap-4">
                  {/* ✅ Top actions */}
                  <Link href="/ecommerce/banners">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                      <Eye className="w-4 h-4 mr-2" />
                      Banners
                    </Button>
                  </Link>
                  <Button
                    onClick={addBanner}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                  </Button>
                  {banners.length > 0 && (
                    <Button
                      onClick={handleSaveBanners}
                      className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                    >
                      Save Banners
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* ✅ Only Creation Form */}
            <CardContent>
              {banners.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Images className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    Ready to Create New Banners?
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Start building your banner by adding details and uploading
                    the image.
                  </p>
                  <Button
                    onClick={addBanner}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-8 py-3"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Banner
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {banners.map((banner) => (
                    <Card
                      key={banner.id}
                      className="transition-all duration-200 hover:shadow-lg border-slate-200 bg-white"
                    >
                      <CardContent className="p-6">
                        <div className="grid grid-cols-12 gap-6 items-start">
                          {/* Left: Image/Video Preview */}
                          <div className="col-span-3">
                            <div className="relative h-24 rounded-lg overflow-hidden border border-slate-200">
                              {banner.isVideo ? (
                                <video
                                  src={banner.preview}
                                  controls
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Image
                                  src={banner.preview || "/placeholder.svg"}
                                  alt="preview"
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                          </div>

                          {/* Middle: Inputs */}
                          <div className="col-span-7 space-y-4">
                            <div>
                              <Label>Banner Title</Label>
                              <Input
                                value={banner.title || ""}
                                onChange={(e) =>
                                  updateBanner(banner.id, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Enter banner title"
                              />
                            </div>

                            {/* New three inputs */}
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label>Button Text</Label>
                                <Input
                                  value={banner.button_text || ""}
                                  onChange={(e) =>
                                    updateBanner(banner.id, {
                                      button_text: e.target.value,
                                    })
                                  }
                                  placeholder="Shop Now"
                                />
                              </div>
                              <div>
                                <Label>Button URL</Label>
                                <Input
                                  type="url"
                                  value={banner.button_url || ""}
                                  onChange={(e) =>
                                    updateBanner(banner.id, {
                                      button_url: e.target.value,
                                    })
                                  }
                                  placeholder="https://example.com"
                                />
                              </div>
                              <div>
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

                            {/* New optional fields */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Description (optional)</Label>
                                <Input
                                  value={banner.description || ""}
                                  onChange={(e) =>
                                    updateBanner(banner.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Short description about the banner"
                                />
                              </div>
                              <div>
                                <Label>Type (optional)</Label>
                                <Input
                                  value={banner.type || ""}
                                  onChange={(e) =>
                                    updateBanner(banner.id, {
                                      type: e.target.value,
                                    })
                                  }
                                  placeholder="Type e.g. promo, hero, seasonal"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>Media Upload</Label>
                              <Input
                                type="file"
                                accept=".jpeg,.png,.jpg,.gif,.webp,.mp4,.mov,.webm"
                                onChange={(e) =>
                                  handleImageUpload(banner.id, e)
                                }
                                className="file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium"
                              />
                            </div>
                          </div>

                          {/* Right: Visibility & Delete */}
                          <div className="col-span-2 flex flex-col items-end gap-4 justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={banner.status === 1}
                                onCheckedChange={(checked) =>
                                  updateBanner(banner.id, {
                                    status: checked ? 1 : 0,
                                  })
                                }
                              />
                              {banner.status ? (
                                <div className="text-green-600 text-xs font-semibold flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Visible
                                </div>
                              ) : (
                                <div className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" /> Hidden
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBanner(banner.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
