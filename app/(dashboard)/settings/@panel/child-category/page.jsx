"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import ChildCategoryFormModal from "./ChildCategoryFormModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useChildCategory from "@/apiHooks/hooks/useChildCategory";

export default function ChildCategoryPage() {
  const { getChildCategories, createMutation, updateMutation, deleteMutation } =
    useChildCategory("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const subcategories =
    getChildCategories?.data?.child_categories?.map(
      (child) => child.sub_category
    ) || [];

  const handleSave = async (formData) => {
    if (editData) {
      await updateMutation.mutateAsync({ id: editData.id, payload: formData });
      setEditData(null);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const confirmDelete = useCallback(
    (id) => {
      toast.warning("Delete this child category?", {
        action: {
          label: "Yes, delete",
          onClick: async () => {
            await deleteMutation.mutateAsync(id);
          },
        },
        cancel: {
          label: "Cancel",
        },
      });
    },
    [deleteMutation]
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Child Categories</h1>
        <Button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Child Category
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                #
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                Subcategory
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                Description
              </th>
              <th className="px-4 py-2 text-right font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {getChildCategories?.data?.child_categories?.map((c, i) => (
              <tr key={c.id}>
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">{c.sub_category?.name || "N/A"}</td>
                <td className="px-4 py-2 text-gray-500">
                  {c.description || "—"}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditData(c);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200"
                    onClick={() => confirmDelete(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* create / edit modal */}
      <ChildCategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        subcategories={subcategories}
        onSave={handleSave}
        initialData={editData}
      />
    </div>
  );
}
