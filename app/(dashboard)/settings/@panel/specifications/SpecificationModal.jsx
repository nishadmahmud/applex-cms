"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveSpecificationMutation } from "@/app/store/api/specificationApi";
import { Trash2, Plus } from "lucide-react";

export default function SpecificationModal({ onClose, editData }) {
  const [form, setForm] = useState({
    category_id: "", // include for edit updates
    name: "",
    description: "",
    values: [
      {
        name: "",
        description: "",
      },
    ],
  });

  const [saveSpecification, { isLoading }] = useSaveSpecificationMutation();

  // --- Load existing item when editing ---
  useEffect(() => {
    if (editData) {
      setForm({
        category_id: editData.id, // 👈 ensure id sent to API on edit
        name: editData.name,
        description: editData.description,
        values:
          editData.specification_values?.map((v) => ({
            id: v.id,
            name: v.name,
            description: v.description,
          })) || [],
      });
    }
  }, [editData]);

  // --- Handlers for dynamic rows ---
  const handleFieldChange = (index, key, value) => {
    const updated = [...form.values];
    updated[index][key] = value;
    setForm({ ...form, values: updated });
  };

  const handleAddRow = () => {
    setForm({
      ...form,
      values: [...form.values, { name: "", description: "" }],
    });
  };

  const handleRemoveRow = (index) => {
    setForm({ ...form, values: form.values.filter((_, i) => i !== index) });
  };

  // --- Submit handler (create or edit) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Please enter a specification category name.");
      return;
    }

    try {
      // include category_id only during edit
      const payload = editData ? { category_id: editData.id, ...form } : form;

      await saveSpecification(payload).unwrap();

      toast.success(
        editData
          ? "Specification updated successfully!"
          : "Specification created successfully!",
      );
      onClose();
    } catch {
      toast.error("Failed to save specification.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- Information Section --- */}
      <div className="grid gap-4">
        <div>
          <Label>Category Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Performance, Design, Material..."
            required
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short note about this specification (optional)"
          />
        </div>
      </div>

      {/* --- Specification Values --- */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Specification Values</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddRow}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="bg-blue-50 text-gray-600">
              <tr>
                <th className="p-2 text-left w-32">Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {form.values.map((v, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <Input
                      value={v.name}
                      onChange={(e) =>
                        handleFieldChange(i, "name", e.target.value)
                      }
                      placeholder="RAM, Processor..."
                      required
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={v.description}
                      onChange={(e) =>
                        handleFieldChange(i, "description", e.target.value)
                      }
                      placeholder="16GB, Intel i7, etc."
                      required
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveRow(i)}
                      disabled={form.values.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Footer Buttons --- */}
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
