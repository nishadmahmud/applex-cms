"use client";
import { Card } from "@/components/ui/card";
import React, { use, useState, useTransition } from "react";
import { CustomServerPagination } from "@/app/utils/CustomServerPagination";
import SettingsSkeleton from "../../SettingsSkeleton";
import { Button } from "@/components/ui/button";
import { confirmationToast } from "@/app/(dashboard)/products/ConfirmationToast";
import { toast } from "sonner";
import { deleteCategory } from "@/lib/actions";
import dynamic from "next/dynamic";
const CategoryForm = dynamic(() => import("./CategoryForm"), { ssr: false });
const CategoryModal = dynamic(() => import("./CategoryModal"), { ssr: false });
// eslint-disable-next-line react/prop-types
export default function CategoryList({ data }) {
  const categories = use(data);
  console.log(categories);
  const [editModal, setEditModal] = useState({});
  const [isPending, startTransition] = useTransition();
  const handleDelete = async (id) => {
    confirmationToast("Delete it ?", {
      action: {
        label: "Yes",
        onClick: async () => {
          try {
            toast.loading("Deleting category...");
            const res = await deleteCategory(id);
            if (res.status === 400) {
              toast.dismiss();
              toast.error(res.message);
            } else {
              toast.dismiss();
              toast.success("Deleted Successfully");
            }
          } catch (error) {
            console.error("Delete failed:", error);
            toast.dismiss();
            toast.error("Failed to delete brand");
          }
        },
      },
      cancel: {
        label: "No",
        onClick: () => {
          toast.info("Delete cancelled");
        },
      },
    });
  };

  const handleOpenEdit = (id) => {
    setEditModal((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
        </div>
        <div className="space-y-3">
          {isPending ? (
            <SettingsSkeleton />
          ) : categories?.data?.data && categories?.data?.data?.length ? (
            categories.data.data.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />

                  {/* small banner beside image */}
                  {item.banner && (
                    <img
                      src={item.banner}
                      alt={`${item.name} banner`}
                      className="w-16 h-10 object-cover rounded border border-gray-200"
                    />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>

                      {/* featured badge */}
                      {item.is_featured ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          Regular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleOpenEdit(item.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>

                {/* edit modal */}
                {editModal[item.id] && (
                  <CategoryModal
                    open={editModal[item.id]}
                    onClose={setEditModal}
                    content={
                      <CategoryForm
                        editableCategory={item}
                        onClose={setEditModal}
                      />
                    }
                  />
                )}
              </div>
            ))
          ) : (
            <p>No Item Available</p>
          )}
        </div>

        <div className="mt-3">
          <CustomServerPagination
            totalPage={categories.data.last_page}
            currentPage={categories.data.current_page}
            transition={startTransition}
          />
        </div>
      </Card>
    </div>
  );
}
