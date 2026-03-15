"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveVariantGroupMutation } from "@/app/store/api/variantGroupApi";

export default function VariantGroupModal({ onClose, editData }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
  });

  const [saveVariantGroup, { isLoading }] = useSaveVariantGroupMutation();

  useEffect(() => {
    if (editData) {
      setForm({
        id: editData.id,
        name: editData.name,
        description: editData.description,
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Please enter variant group name");
      return;
    }

    try {
      await saveVariantGroup(form).unwrap();
      toast.success(
        editData
          ? "Variant group updated successfully!"
          : "Variant group created successfully!",
      );
      onClose();
    } catch {
      toast.error("Failed to save variant group.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Variant Group Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Color, Size"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional short description"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
