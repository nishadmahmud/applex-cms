"use client";

import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Upload } from "lucide-react";
import Link from "next/link";

const AuthorForm = ({
  formData,
  onChange,
  onSubmit,
  setImageFile,
  isUpdating = false,
  editingMode = false,
}) => {
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile?.(file);
      onChange("image", URL.createObjectURL(file)); // local preview only
    }
  };

  return (
    <div className="mx-auto px-6 py-8">
      <Card className="p-8 max-w-3xl mx-auto">
        {/* Photo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar className="w-24 h-24 shadow-lg border-4 border-white">
              <AvatarImage src={formData.image} />
              <AvatarFallback className="bg-gray-100 text-gray-400">
                <Upload className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50 border"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-6">
          <div>
            <Label
              htmlFor="author-name"
              className="text-sm font-medium text-gray-700"
            >
              Author Name
            </Label>
            <Input
              id="author-name"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Enter author name"
              className="mt-2"
            />
          </div>

          <div>
            <Label
              htmlFor="author-education"
              className="text-sm font-medium text-gray-700"
            >
              Education
            </Label>
            <Input
              id="author-education"
              value={formData.education}
              onChange={(e) => onChange("education", e.target.value)}
              placeholder="e.g., University / Degree"
              className="mt-2"
            />
          </div>

          <div>
            <Label
              htmlFor="author-description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="author-description"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Short biography or notes about the author"
              rows={4}
              className="mt-2 resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Number(formData.active) === 1}
              onChange={(e) =>
                onChange("active", e.target.checked ? 1 : 0)
              }
              id="author-active"
            />
            <Label htmlFor="author-active" className="text-sm text-gray-700">
              Active
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/settings/authors">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              disabled={isUpdating}
              onClick={onSubmit}
              type="button"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingMode ? "Update Author" : "Save Author"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthorForm;

