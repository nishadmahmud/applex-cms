"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useFooter from "@/apiHooks/hooks/useFooterQuery";

export default function EditFooterPopup({ open, onClose, footer }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bg_color: "#1A1A1A",
    status: true,
    nav_items: [{ name: "", link: "", status: true }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateFooter } = useFooter();

  useEffect(() => {
    if (footer && open) {
      setFormData({
        title: footer.title || "",
        description: footer.description || "",
        bg_color: footer.bg_color || "#1A1A1A",
        status: Boolean(footer.status),
        nav_items:
          footer.nav_items?.length > 0
            ? footer.nav_items.map((item) => ({
                name: item.name || "",
                link: item.link || "",
                status: Boolean(item.status),
              }))
            : [{ name: "", link: "", status: true }],
      });
    }
  }, [footer, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      nav_items: [...prev.nav_items, { name: "", link: "", status: true }],
    }));
  };

  const removeNavItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      nav_items: prev.nav_items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!footer) return;

    setIsSubmitting(true);

    try {
      // Filter out empty nav items
      const validNavItems = formData.nav_items.filter(
        (item) => item.name.trim() && item.link.trim()
      );

      const payload = {
        ...formData,
        nav_items: validNavItems,
      };

      await updateFooter.mutateAsync({ id: footer.id, payload });
      toast.success("Footer updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update footer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!footer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Footer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter footer title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter footer description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bg_color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg_color"
                    type="color"
                    value={formData.bg_color}
                    onChange={(e) =>
                      handleInputChange("bg_color", e.target.value)
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.bg_color}
                    onChange={(e) =>
                      handleInputChange("bg_color", e.target.value)
                    }
                    placeholder="#1A1A1A"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-2 h-10">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleInputChange("status", checked)
                    }
                  />
                  <span className="text-sm">
                    {formData.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Navigation Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNavItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {formData.nav_items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Item {index + 1}
                      </span>
                      {formData.nav_items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNavItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            handleNavItemChange(index, "name", e.target.value)
                          }
                          placeholder="Navigation name"
                          size="sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Link</Label>
                        <Input
                          value={item.link}
                          onChange={(e) =>
                            handleNavItemChange(index, "link", e.target.value)
                          }
                          placeholder="https://example.com"
                          size="sm"
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
                      <span className="text-xs">
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating..." : "Update Footer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
