"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { useDeleteEntityMutation } from "@/app/store/api/sharedApi";
import { confirmationToast } from "@/app/(dashboard)/products/ConfirmationToast";

const ActionButtons = ({ id, token, type }) => {
  const [deleteEntity] = useDeleteEntityMutation();
  const endPoint =
    type === "category"
      ? "delete-category"
      : type === "subcategory"
      ? "delete-subcategory"
      : type === "unit"
      ? "delete-unit"
      : type === "warranty"
      ? "warranty-delete"
      : "delete-brand";
  const payload =
    type === "category"
      ? { categoryId: id }
      : type === "subcategory"
      ? { subcategoryId: id }
      : type === "unit"
      ? { unitId: id }
      : type === "warranty"
      ? { warrantyId: id }
      : { brandId: id };

  const handleDelete = async () => {
    confirmationToast("Delete it ?", {
      action: {
        label: "Yes",
        onClick: async () => {
          try {
            toast.loading("Deleting...");
            const res = await deleteEntity({
              endPoint,
              body: payload,
            }).unwrap();
            if (res.success || res.status === "success") {
              toast.dismiss();
              toast.success("Deleted Successfully");
            } else {
              toast.dismiss();
              toast.error(res.message || "Failed to delete");
            }
          } catch (error) {
            console.error("Delete failed:", error);
            toast.dismiss();
            toast.error("Failed to delete");
          }
        },
      },
      cancel: {
        label: "No",
        onClick: () => {
          console.log("Delete cancelled");
          toast.info("Delete cancelled");
        },
      },
    });
  };
  return (
    <div className="flex space-x-2 justify-end">
      <Link href={`/settings/brands/edit-brand/${id}`}>
        <Button
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Edit
        </Button>
      </Link>
      <Button
        onClick={handleDelete}
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        Delete
      </Button>
    </div>
  );
};

export default ActionButtons;
