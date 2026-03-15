"use client";
import React, { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BarcodeLabel from "./BarcodeLabel";
import { toast } from "sonner";
import { confirmationToast } from "./ConfirmationToast";
import axios from "axios";
import { useSession } from "next-auth/react";
import VariantsModal from "./VariantsModal";

// Shadcn DropdownMenu imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

function ProductsTable({ allProducts, mutateProductList, currentPage, limit }) {
  const { data: session } = useSession();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getBorderColor = (stock) => {
    if (stock < 1) {
      return "border-red-400"; // out of stock
    } else if (stock < 10) {
      return "border-yellow-400"; // low stock
    } else {
      return "border-green-400"; // healthy stock
    }
  };

  const isEmployee = !!session?.isEmployee;

  // fetch employee features (will stay idle for normal user)
  const { data: features } = useRolePermissions();

  // decide if Add Product visible:
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
          try {
            toast.loading("Deleting product...");
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API}/delete-product`,
              { productId },
              {
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                },
              }
            );
            if (res.data.success) {
              await res.data;
              mutateProductList();
              toast.dismiss();
              toast.success("Product deleted successfully!");
            } else {
              toast.dismiss();
              toast.error(res.data.message);
            }
          } catch (error) {
            console.error("Delete failed:", error);
            toast.dismiss();
            toast.error("Failed to delete product");
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

  const handleOpenVariants = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <VariantsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
      />

      {!allProducts.length ? (
        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
          No Products Available
        </div>
      ) : (
        (allProducts || []).map((product) => {
          const borderColor = getBorderColor(product?.current_stock);
          return (
            <div
              key={product?.id}
              className={`bg-white rounded-lg border-2 ${borderColor} p-4 shadow-sm relative`}
            >
              <div className="flex flex-wrap gap-3 md:gap-4 items-start md:items-center">
                {/* Left Section - Product Image */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  {(() => {
                    // 1️⃣ Choose correct media source
                    const src =
                      product?.image_path ||
                      product?.image_paths?.[0] ||
                      "https://pos.outletexpense.com/layoutlogo.svg" ||
                      "/placeholder.svg";

                    // 2️⃣ Detect whether it's a video (by file extension or MIME if you have it)
                    const lower =
                      typeof src === "string" ? src.toLowerCase() : "";
                    const isVideo =
                      lower.endsWith(".mp4") ||
                      lower.endsWith(".mov") ||
                      lower.endsWith(".webm") ||
                      lower.endsWith(".ogg");

                    // 3️⃣ Render accordingly
                    return isVideo ? (
                      <video
                        src={src}
                        controls
                        playsInline
                        muted // helpful for autoplay
                        className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] object-cover rounded-lg border bg-black"
                      >
                        Sorry, your browser doesn’t support embedded videos.
                      </video>
                    ) : (
                      <Image
                        src={src}
                        priority
                        alt={product?.name || "Product media"}
                        width={140}
                        height={140}
                        className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] object-cover rounded-lg border"
                      />
                    );
                  })()}
                </div>

                {/* Middle Section - Product Details */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  {/* Product Name and ID */}
                  <div className="col-span-1 md:col-span-2 flex gap-2 items-baseline">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                      {product?.name}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm font-medium shrink-0">
                      #{product?.id}
                    </p>
                  </div>

                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Category
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.category?.name || "-"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Sub Category
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.sub_category?.name || "-"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Brand
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.brands?.name || "-"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Serial
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {product?.serial || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Unit
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.unit?.name || "Pc"}
                      </span>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Purchase price
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.purchase_price || 0} BDT
                      </span>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                        Retail price
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className="font-semibold text-gray-900">
                        {product?.retails_price || 0} BDT
                      </span>
                    </div>

                    {/* Show Items Count if available */}
                    {product?.items && product.items.length > 0 && (
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                          Product Items
                        </span>
                        <span className="text-gray-600">:</span>
                        <span className="font-semibold text-gray-900">
                          {product.items.length} variants
                        </span>
                      </div>
                    )}

                    {/* Show Variants Button if imeis available */}
                    {product?.imeis && product.imeis.length > 0 && (
                      <div className="flex gap-2 text-sm items-center">
                        <span className="text-gray-700 font-medium min-w-[80px] md:min-w-[110px]">
                          Variants
                        </span>
                        <span className="text-gray-600">:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenVariants(product)}
                          className="h-6 text-xs px-2 hover:bg-gray-100"
                        >
                          View {product.imeis.length} Variants
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section - Action Buttons and Barcode */}
                <div className="hidden md:flex flex-shrink-0 flex-col items-end gap-3">
                  {/* Action Buttons in DropdownMenu — desktop */}
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
                            href={`/edit-product/${product?.id}`}
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
                            href={`products/${product?.id}`}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canDeleteProduct && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(product?.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Barcode Section — desktop */}
                  <BarcodeLabel
                    barcodeValue={product?.serial || product?.id?.toString()}
                    name={product?.name}
                    price={product?.retails_price || 0}
                  />
                </div>
              </div>

              {/* ===== MOBILE-ONLY: Action Menu (top-right) + Barcode (below content) ===== */}
              <div className="md:hidden">
                {/* Action menu — absolute top-right corner */}
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100"
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
                            href={`/edit-product/${product?.id}`}
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
                            href={`products/${product?.id}`}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canDeleteProduct && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(product?.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Barcode — centered below content */}
                <div className="mt-3 flex justify-center">
                  <BarcodeLabel
                    barcodeValue={product?.serial || product?.id?.toString()}
                    name={product?.name}
                    price={product?.retails_price || 0}
                  />
                </div>
              </div>

              {/* Stock Badge */}
              {/* <div className="absolute top-4 right-4">
                <Badge
                  className={`${getStockBadgeColor(
                    product?.current_stock
                  )} px-3 py-1 text-sm font-semibold`}
                >
                  {getStockText(product?.current_stock)}
                </Badge>
              </div> */}
            </div>
          );
        })
      )}
    </div>
  );
}

export default memo(ProductsTable);
