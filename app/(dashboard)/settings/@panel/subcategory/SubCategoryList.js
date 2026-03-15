"use client";
import { Card } from "@/components/ui/card";
import React, { use, useState, useTransition } from "react";
import { CustomServerPagination } from "@/app/utils/CustomServerPagination";
import SettingsSkeleton from "../../SettingsSkeleton";
import { Button } from "@/components/ui/button";
import { confirmationToast } from "@/app/(dashboard)/products/ConfirmationToast";
import { toast } from "sonner";
import { deleteSubCategory } from "@/lib/actions";
import dynamic from "next/dynamic";

const SubCategoryForm = dynamic(() => import("./SubCategoryForm"), {
  ssr: false,
});
const SubCategoryModal = dynamic(() => import("../category/CategoryModal"), {
  ssr: false,
});

// eslint-disable-next-line react/prop-types
export default function SubCategoryList({ data }) {
  const subCategories = use(data);

  console.log(subCategories.data.data);

  const [editModal, setEditModal] = useState({});
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id) => {
    confirmationToast("Delete it ?", {
      action: {
        label: "Yes",
        onClick: async () => {
          try {
            toast.loading("Deleting subcategory...");
            const res = await deleteSubCategory(id);
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
    <div className="mt-5">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
        </div>

        <div className="space-y-3">
          {isPending ? (
            <SettingsSkeleton />
          ) : subCategories?.data?.data && subCategories?.data?.data?.length ? (
            subCategories.data.data.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start space-x-4 w-full md:w-auto">
                  <span className="text-lg">{item.flag}</span>
                  <div className="flex flex-col space-y-2">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>

                    {/* display category name */}
                    {item?.category?.name && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-gray-700">
                          Category:
                        </span>{" "}
                        <span className="italic text-blue-600">
                          {item.category.name}
                        </span>
                      </p>
                    )}

                    {/* optional subtitle */}
                    {item.subtitle && (
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    )}

                    {/* display images and banners */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {item.images &&
                        item.images.length > 0 &&
                        item.images.map((img, idx) => (
                          <div key={idx}>
                            <img
                              src={img}
                              alt={`${item.name}-image-${idx}`}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <p className="text-[10px] text-gray-500 text-center">
                              Image
                            </p>
                          </div>
                        ))}

                      {item.banners &&
                        item.banners.length > 0 &&
                        item.banners.map((banner, idx) => (
                          <div key={idx}>
                            <img
                              src={banner}
                              alt={`${item.name}-banner-${idx}`}
                              className="w-24 h-16 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <p className="text-[10px] text-gray-500 text-center">
                              Banner
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 justify-end mt-3 md:mt-0">
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
                  <SubCategoryModal
                    open={editModal[item.id]}
                    onClose={setEditModal}
                    content={
                      <SubCategoryForm
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
            totalPage={subCategories.data.last_page}
            currentPage={subCategories.data.current_page}
            transition={startTransition}
          />
        </div>
      </Card>
    </div>
  );
}
