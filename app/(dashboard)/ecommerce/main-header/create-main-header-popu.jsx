"use client";
import React from "react";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import useMainHeaderQuery from "@/apiHooks/hooks/useMainHeaderQuery";
import { imageUpload } from "@/app/store/imageSlice";
import { useSession } from "next-auth/react";
// import useMainHeaderQuery from "@/hooks/useMainHeaderQuery";
// import { imageUpload } from "@/app/store/imageSlice";

const CreateMainHeaderPopup = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { data: session, status, update: updateSession } = useSession();
  const { createHeader } = useMainHeaderQuery();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bg_color: "#1A1A1A",
    status: true,
    nav_items: [{ name: "", link: "", icon: null, status: true }],
  });

  const [iconFiles, setIconFiles] = useState({});
  const [iconPreviews, setIconPreviews] = useState({});
  const fileInputRefs = useRef({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNavItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      nav_items: prev.nav_items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addNavItem = () => {
    setFormData((prev) => ({
      ...prev,
      nav_items: [
        ...prev.nav_items,
        { name: "", link: "", icon: null, status: true },
      ],
    }));
  };

  const removeNavItem = (index) => {
    if (formData.nav_items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        nav_items: prev.nav_items.filter((_, i) => i !== index),
      }));
      // Clean up file references
      delete iconFiles[index];
      delete iconPreviews[index];
      delete fileInputRefs.current[index];
    }
  };

  const handleIconUpload = (index, file) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setIconFiles((prev) => ({ ...prev, [index]: file }));
      setIconPreviews((prev) => ({ ...prev, [index]: preview }));
    }
  };

  const removeIcon = (index) => {
    setIconFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setIconPreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
        delete newPreviews[index];
      }
      return newPreviews;
    });
    handleNavItemChange(index, "icon", null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.bg_color) {
      toast.error("Background color is required");
      return;
    }

    const validNavItems = formData.nav_items.filter(
      (item) => item.name.trim() && item.link.trim()
    );
    if (validNavItems.length === 0) {
      toast.error(
        "At least one navigation item with name and link is required"
      );
      return;
    }

    setIsLoading(true);
    toast.loading("Creating header...");

    try {
      // Upload icons for nav items that have files
      const processedNavItems = await Promise.all(
        validNavItems.map(async (item, index) => {
          let iconPath = item.icon;

          if (iconFiles[index]) {
            try {
              const uploadResult = await dispatch(
                imageUpload({
                  image: iconFiles[index],
                  token: session.accessToken,
                })
              ).unwrap();
              iconPath = uploadResult;
            } catch (error) {
              console.error(`Failed to upload icon for ${item.name}:`, error);
              toast.error(`Failed to upload icon for ${item.name}`);
            }
          }

          return {
            name: item.name,
            link: item.link,
            icon: iconPath,
            status: item.status,
          };
        })
      );

      const payload = {
        bg_color: formData.bg_color,
        status: formData.status,
        nav_items: processedNavItems,
      };

      await createHeader.mutateAsync(payload);
      toast.dismiss();
      toast.success("Header created successfully!");
      onClose();
    } catch (error) {
      console.error("Create header error:", error);
      toast.dismiss();
      toast.error("Failed to create header");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Main Header</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-gray-900">Header Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bg_color">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="bg_color"
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) =>
                        handleInputChange("bg_color", e.target.value)
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={formData.bg_color}
                      onChange={(e) =>
                        handleInputChange("bg_color", e.target.value)
                      }
                      placeholder="#1A1A1A"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleInputChange("status", checked)
                    }
                  />
                  <Label htmlFor="status">Active Status</Label>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div
                  className="w-full h-12 rounded border flex items-center px-4"
                  style={{ backgroundColor: formData.bg_color }}
                >
                  <span className="text-white text-sm">Header Preview</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Items */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Navigation Items</h3>
                <Button
                  type="button"
                  onClick={addNavItem}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {formData.nav_items.map((item, index) => (
                  <Card
                    key={index}
                    className="border-2 border-dashed border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-sm">
                          Navigation Item {index + 1}
                        </h4>
                        {formData.nav_items.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeNavItem(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleNavItemChange(index, "name", e.target.value)
                            }
                            placeholder="e.g., Home, About Us"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Link *</Label>
                          <Input
                            value={item.link}
                            onChange={(e) =>
                              handleNavItemChange(index, "link", e.target.value)
                            }
                            placeholder="https://example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Icon (Optional)</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            {iconPreviews[index] ? (
                              <div className="space-y-2">
                                <img
                                  src={
                                    iconPreviews[index] || "/placeholder.svg"
                                  }
                                  alt={`Icon for ${item.name}`}
                                  className="w-8 h-8 object-contain mx-auto"
                                />
                                <div className="flex justify-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      fileInputRefs.current[index]?.click()
                                    }
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Change
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeIcon(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-6 h-6 mx-auto text-gray-400" />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    fileInputRefs.current[index]?.click()
                                  }
                                >
                                  Upload Icon
                                </Button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) => (fileInputRefs.current[index] = el)}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleIconUpload(index, file);
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={item.status}
                            onCheckedChange={(checked) =>
                              handleNavItemChange(index, "status", checked)
                            }
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Creating..." : "Create Header"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMainHeaderPopup;
