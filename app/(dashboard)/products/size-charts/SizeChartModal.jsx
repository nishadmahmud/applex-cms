"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveSizeChartMutation } from "@/app/store/api/sizeChartApi";
import { Trash2, Plus } from "lucide-react";

export default function SizeChartModal({ onClose, editData }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sizes: [
      {
        size_label: "",
        chest: "",
        waist: "",
        hip: "",
        length: "",
        shoulder: "",
      },
    ],
  });

  const [saveSizeChart, { isLoading }] = useSaveSizeChartMutation();

  useEffect(() => {
    if (editData) {
      setForm({
        category_id: editData.id,
        name: editData.name,
        description: editData.description,
        sizes:
          editData.size_chart_values?.map((s) => ({
            id: s.id,
            size_label: s.size_label,
            chest: s.chest,
            waist: s.waist,
            hip: s.hip,
            length: s.length,
            shoulder: s.shoulder,
          })) || [],
      });
    }
  }, [editData]);

  const handleFieldChange = (index, key, value) => {
    const updated = [...form.sizes];
    updated[index][key] = value;
    setForm({ ...form, sizes: updated });
  };

  const handleAddRow = () => {
    setForm({
      ...form,
      sizes: [
        ...form.sizes,
        {
          size_label: "",
          chest: "",
          waist: "",
          hip: "",
          length: "",
          shoulder: "",
        },
      ],
    });
  };

  const handleRemoveRow = (index) => {
    setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Please enter a chart name.");
      return;
    }

    try {
      await saveSizeChart(form).unwrap();
      toast.success(
        editData ? "Updated successfully!" : "Created successfully!",
      );
      onClose();
    } catch {
      toast.error("Failed to save size chart.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label>Chart Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Men Shirts"
            required
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short note about this chart (optional)"
          />
        </div>
      </div>

      {/* Size rows */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Sizes</Label>
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
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-blue-50 text-gray-600">
              <tr>
                <th className="p-2 text-left w-24">Label</th>
                <th className="p-2 text-center">Chest</th>
                <th className="p-2 text-center">Waist</th>
                <th className="p-2 text-center">Hip</th>
                <th className="p-2 text-center">Length</th>
                <th className="p-2 text-center">Shoulder</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {form.sizes.map((s, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <Input
                      value={s.size_label}
                      onChange={(e) =>
                        handleFieldChange(i, "size_label", e.target.value)
                      }
                      placeholder="S, M, L, XL"
                      required
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.chest}
                      onChange={(e) =>
                        handleFieldChange(i, "chest", e.target.value)
                      }
                      placeholder="38"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.waist}
                      onChange={(e) =>
                        handleFieldChange(i, "waist", e.target.value)
                      }
                      placeholder="30"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.hip}
                      onChange={(e) =>
                        handleFieldChange(i, "hip", e.target.value)
                      }
                      placeholder="36"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.length}
                      onChange={(e) =>
                        handleFieldChange(i, "length", e.target.value)
                      }
                      placeholder="26"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={s.shoulder}
                      onChange={(e) =>
                        handleFieldChange(i, "shoulder", e.target.value)
                      }
                      placeholder="18"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveRow(i)}
                      disabled={form.sizes.length === 1}
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
