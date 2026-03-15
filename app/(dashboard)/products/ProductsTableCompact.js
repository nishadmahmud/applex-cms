"use client";
import React, { memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import { confirmationToast } from "./ConfirmationToast";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

function ProductsTableCompact({ allProducts, mutateProductList }) {
  const { data: session } = useSession();
  const { data: features } = useRolePermissions();
  const isEmployee = !!session?.isEmployee;

  const canEditProduct =
    !isEmployee || canAccess(features, "Products", "Product Update");
  const canDeleteProduct =
    !isEmployee || canAccess(features, "Products", "Product Delete");
  const canViewProductDetails =
    !isEmployee || canAccess(features, "Products", "Product Details");

  const handleDelete = async (productId) => {
    confirmationToast("Delete it ?", {
      action: {
        label: "Yes",
        onClick: async () => {
          const hide = toast.loading("Deleting product...");

          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API}/delete-product`,
              { productId },
              {
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                },
              },
            );

            // Safely extract and normalize
            const data = res?.data || {};
            const isSuccess =
              data?.success === true ||
              data?.status === 200 ||
              data?.status === "200"; // handle string 200 from some APIs

            toast.dismiss(hide);

            if (isSuccess) {
              mutateProductList?.();
              toast.success(data?.message || "Product deleted successfully!");
            } else {
              toast.error(data?.message || "Failed to delete product.");
            }
          } catch (error) {
            console.error("Delete failed:", error);
            toast.dismiss();
            // If backend sent a JSON error message, surface it nicely
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              "An unexpected error occurred while deleting product.";
            toast.error(msg);
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

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm text-gray-900">
        <thead className="bg-gray-100 border-b sticky top-0 z-10">
          <tr>
            <th className="p-2 text-left font-semibold">ID</th>
            <th className="p-2 text-left font-semibold">Product Name</th>
            <th className="p-2 text-left font-semibold">Serial No.</th>
            <th className="p-2 text-left font-semibold">Category</th>
            <th className="p-2 text-left font-semibold">Sub Category</th>
            <th className="p-2 text-left font-semibold">Brand</th>
            <th className="p-2 text-left font-semibold">Stock</th>
            <th className="p-2 text-left font-semibold">Purchase (BDT)</th>
            <th className="p-2 text-left font-semibold">Retail (BDT)</th>
            <th className="p-2 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(allProducts || []).length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center p-4 text-gray-500">
                No products available
              </td>
            </tr>
          ) : (
            allProducts.map((p, index) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2 font-medium">{p.serial || "-"}</td>
                <td className="p-2">{p.category?.name || "-"}</td>
                <td className="p-2">{p.sub_category?.name || "-"}</td>
                <td className="p-2">{p.brands?.name || "-"}</td>
                <td className="p-2">{p.current_stock || 0}</td>
                <td className="p-2">{p.purchase_price || 0}</td>
                <td className="p-2">{p.retails_price || 0}</td>

                {/* 🎯 Actions Column */}
                <td className="p-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-100 transition-all duration-200"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-lg shadow-md border border-gray-100"
                    >
                      {canEditProduct && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/edit-product/${p.id}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canViewProductDetails && (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/products/${p.id}`}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canDeleteProduct && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(p.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProductsTableCompact);
