"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Package,
  CheckCircle,
  BarChart3,
  Barcode,
  Calendar,
  Tag,
  Box,
  Layers,
  BarcodeIcon,
  Hash,
} from "lucide-react";
import { PiBarcode } from "react-icons/pi";
import { useGetProductDetailsQuery } from "@/app/store/api/productsApi";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import BarcodeLabel from "../BarcodeLabel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QuantityDiscountPack from "./QuantityDiscountPack";
import { toast } from "sonner";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function POSProductView() {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;
  const params = useParams();
  const id = params.id;
  const [selectedImage, setSelectedImage] = useState(0);

  // fetch employee features (will stay idle for normal user)
  const { data: features } = useRolePermissions();
  // decide if Add Product visible:
  const canEditProduct =
    !isEmployee || canAccess(features, "Products", "Product Update");
  // decide if Product Details accessible:
  const hasProductDetailsAccess =
    !isEmployee || canAccess(features, "Products", "Product Details");

  const { data: product, isLoading } = useGetProductDetailsQuery(
    { id },
    { skip: !hasProductDetailsAccess || !id || status !== "authenticated" }
  );

  const productData = product?.data;
  const quantityDiscounts = productData?.quantity_discounts || []; // Safely get the data

  // Extract all available images safely
  const extractAllImages = (productData) => {
    if (!productData) return [];

    const images = new Set(); // avoid duplicates

    // 1️⃣ Collect from main product image fields (image_path, image_path1, ...)
    Object.keys(productData).forEach((key) => {
      if (
        key.startsWith("image_path") &&
        productData[key] &&
        typeof productData[key] === "string"
      ) {
        images.add(productData[key]);
      }
    });

    // 2️⃣ Collect from image_paths array (if exists)
    if (Array.isArray(productData.image_paths)) {
      productData.image_paths.forEach((img) => {
        if (img && typeof img === "string") images.add(img);
      });
    }

    // 3️⃣ Collect from each product item image
    if (Array.isArray(productData.items)) {
      productData.items.forEach((item) => {
        if (Array.isArray(item.images)) {
          // Check if 'images' is a valid array
          item.images.forEach((img) => {
            // Iterate over the array
            if (img && typeof img === "string") {
              images.add(img); // Add each image URL
            }
          });
        }
      });
    }

    // 4️⃣ (Optional) Collect from variants, bundles, campaigns if they have images
    ["variants", "product_variants", "bundles", "campaigns"].forEach(
      (section) => {
        if (Array.isArray(productData[section])) {
          productData[section].forEach((obj) => {
            if (obj.image && typeof obj.image === "string") {
              images.add(obj.image);
            }
          });
        }
      }
    );

    return Array.from(images);
  };

  const productImages = extractAllImages(productData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // if (!productData) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-gray-600">Product not found</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <ProtectedRoute featureName="Products" optionName="Product Details">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Product Information
                </h1>
                <p className="text-gray-600">
                  Complete product details and inventory
                </p>
              </div>
              {canEditProduct && (
                <Link href={`/edit-product/${id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Images - Left Column */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  {/* Main Image */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-4 aspect-square border">
                    {(() => {
                      const src =
                        productImages[selectedImage] ||
                        "/placeholder.svg?height=400&width=400" ||
                        "/placeholder.svg";

                      const lower = (src || "").toLowerCase();
                      const isVideo =
                        lower.endsWith(".mp4") ||
                        lower.endsWith(".mov") ||
                        lower.endsWith(".webm") ||
                        lower.endsWith(".ogg");

                      return isVideo ? (
                        <video
                          src={src}
                          controls
                          playsInline
                          muted
                          className="w-full h-full object-contain rounded-lg bg-black"
                        >
                          Sorry, your browser doesn’t support embedded videos.
                        </video>
                      ) : (
                        <Image
                          src={src}
                          alt={productData?.name || "Product"}
                          width={400}
                          height={400}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      );
                    })()}
                  </div>

                  {/* Thumbnail Images */}
                  {productImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productImages.map((image, index) => {
                        const lower = (image || "").toLowerCase();
                        const isVideo =
                          lower.endsWith(".mp4") ||
                          lower.endsWith(".mov") ||
                          lower.endsWith(".webm") ||
                          lower.endsWith(".ogg");

                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                              selectedImage === index
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {isVideo ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <video
                                  src={image}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                                {/* small play icon centered */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="white"
                                  viewBox="0 0 24 24"
                                  className="absolute w-6 h-6 opacity-90 drop-shadow"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            ) : (
                              <Image
                                src={image || "/placeholder.svg"}
                                alt={`View ${index + 1}`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover bg-gray-50"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Barcode Section */}
                  {/* {productData?.barcode && (
                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Barcode className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Product Barcode
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-lg font-bold mb-2">
                        {productData.barcode}
                      </div>
                      <div className="flex gap-[2px] justify-center">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gray-900"
                            style={{
                              height: `${Math.random() * 30 + 30}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}
                </CardContent>
              </Card>
            </div>

            {/* Product Details - Right Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {productData?.name}
                    </CardTitle>
                    <Badge
                      onClick={() => {
                        navigator.clipboard.writeText(productData?.sku || "");
                        toast.success("SKU copied!");
                      }}
                      variant="outline"
                      className="text-sm cursor-pointer"
                    >
                      SKU: {productData?.sku}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productData?.category?.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-semibold text-gray-900">
                            {productData.category.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {productData?.sub_category?.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Layers className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Sub Category</p>
                          <p className="font-semibold text-gray-900">
                            {productData.sub_category.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {productData?.child_category?.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Box className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Child Category
                          </p>
                          <p className="font-semibold text-gray-900">
                            {productData.child_category.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {productData?.brands?.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Tag className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Brand</p>
                          <p className="font-semibold text-gray-900">
                            {productData.brands.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {productData?.unit?.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Package className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Unit</p>
                          <p className="font-semibold text-gray-900">
                            {productData.unit.name}
                          </p>
                        </div>
                      </div>
                    )}
                    {productData?.product_type && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Box className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Product Type</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {productData.product_type}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  {(productData?.serial ||
                    productData?.color ||
                    productData?.color_code) && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {productData?.serial && (
                          <div>
                            <p className="text-sm text-gray-600">Serial</p>
                            <p className="font-medium text-gray-900">
                              {productData.serial}
                            </p>
                          </div>
                        )}
                        {productData?.color && (
                          <div>
                            <p className="text-sm text-gray-600">Color</p>
                            <div className="flex items-center gap-2">
                              {productData?.color_code && (
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{
                                    backgroundColor: productData.color_code,
                                  }}
                                />
                              )}
                              <p className="font-medium text-gray-900">
                                {productData.color}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pricing Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Purchase Price
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        ৳
                        {productData?.purchase_price
                          ? parseFloat(
                              productData.purchase_price
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Retail Price
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        ৳
                        {productData?.retails_price
                          ? parseFloat(
                              productData.retails_price
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium mb-1">
                        Wholesale Price
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        ৳
                        {productData?.wholesale_price
                          ? parseFloat(
                              productData.wholesale_price
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium mb-1">
                        Regular Price
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        ৳
                        {productData?.regular_price
                          ? parseFloat(
                              productData.regular_price
                            ).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                  </div>

                  {/* Discount Info */}
                  {productData?.discount > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-red-700 font-medium">
                          Discount Available
                        </span>
                        <div className="text-right">
                          <span className="text-red-600 font-semibold text-lg">
                            {productData.discount}
                            {productData?.discount_type === "percentage"
                              ? "%"
                              : " ৳"}
                          </span>
                          {productData?.discount_type && (
                            <p className="text-xs text-red-600">
                              {productData.discount_type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stock Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Stock & Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium mb-1">
                        Current Stock
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {productData?.current_stock || 0}{" "}
                        <span className="text-sm">
                          {productData?.unit?.name || "pcs"}
                        </span>
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium mb-1">
                        Minimum Stock
                      </p>
                      <p className="text-2xl font-bold text-orange-700">
                        {productData?.minimum_stock || 0}{" "}
                        <span className="text-sm">
                          {productData?.unit?.name || "pcs"}
                        </span>
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Total Quantity
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {productData?.quantity || 0}{" "}
                        <span className="text-sm">
                          {productData?.unit?.name || "pcs"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div
                    className={`p-3 rounded-lg border ${
                      (productData?.current_stock || 0) >
                      (productData?.minimum_stock || 0)
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${
                          (productData?.current_stock || 0) >
                          (productData?.minimum_stock || 0)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          (productData?.current_stock || 0) >
                          (productData?.minimum_stock || 0)
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {(productData?.current_stock || 0) >
                        (productData?.minimum_stock || 0)
                          ? "In Stock - Available for Sale"
                          : "Low Stock - Reorder Required"}
                      </span>
                    </div>
                  </div>

                  {/* Variable Weight */}
                  {productData?.is_variable_weight === 1 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-700 font-medium text-sm">
                        ⚖️ Variable Weight Product
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Variants/Items */}
              {productData?.items && productData.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Product Variants ({productData.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productData.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-4 border rounded-lg bg-gray-50 relative"
                        >
                          {/* Modal Trigger Icon Button at the top-right */}
                          <div className="absolute top-2 right-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="View or Download Barcode"
                                >
                                  <PiBarcode className="w-6 h-4" />
                                </Button>
                              </DialogTrigger>

                              {/* Modal Barcode */}
                              <DialogContent className="max-w-xs">
                                {/* <DialogHeader>
                                <DialogTitle>Barcode Label</DialogTitle>
                              </DialogHeader> */}
                                <div className="p-2 flex justify-center">
                                  <BarcodeLabel
                                    barcodeValue={
                                      item.barcode || item.id?.toString()
                                    }
                                    name={item.sku || productData?.name}
                                    price={item.sell_price || 0}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Main Card Content */}
                          <div className="flex gap-4">
                            {item.images &&
                              item.images.length > 0 && ( // 👈 CHECK FOR THE ARRAY AND ITS LENGTH
                                <Image
                                  src={item.images[0] || "/placeholder.svg"} // 👈 USE THE FIRST ELEMENT
                                  alt={`Variant ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                              )}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-gray-600">SKU</p>
                                <p
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      item?.sku || ""
                                    );
                                    toast.success("SKU copied!");
                                  }}
                                  className="font-mono font-semibold text-sm cursor-pointer"
                                >
                                  {item.sku}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Barcode</p>
                                <p className="font-mono font-semibold text-sm">
                                  {item.barcode}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Sell Price
                                </p>
                                <p className="font-semibold text-green-700">
                                  ৳{" "}
                                  {parseFloat(item.sell_price).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Purchase Price
                                </p>
                                <p className="font-semibold text-green-700">
                                  ৳{" "}
                                  {parseFloat(
                                    item.purchase_price
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">
                                  Quantity
                                </p>
                                <p className="font-mono font-semibold text-sm">
                                  {item.quantity}
                                </p>
                              </div>
                              {item?.discount && (
                                <div>
                                  <p className="text-xs text-gray-600">
                                    Discount
                                  </p>
                                  <p className="font-mono font-semibold text-sm">
                                    {item.discount}
                                  </p>
                                </div>
                              )}
                              {item?.description && (
                                <div>
                                  <p className="text-xs text-gray-600">
                                    Description
                                  </p>
                                  <p className="font-mono font-semibold text-sm">
                                    {item.description}
                                  </p>
                                </div>
                              )}
                              {item?.status && (
                                <div>
                                  <p className="text-xs text-gray-600">
                                    Status
                                  </p>
                                  <p className="font-mono font-semibold text-sm capitalize">
                                    {item.status}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Attributes */}
                          {item.attributes && item.attributes.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.attributes.map((attr) => (
                                <Badge
                                  key={attr.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {attr.attribute?.name}:{" "}
                                  {attr.attribute_value?.value || "N/A"}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Bundles */}
              {productData?.bundles && productData.bundles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      Product Bundle
                      {/* ({productData.bundles.length}) */}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productData.bundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        className="p-4 border-2 border-indigo-100 rounded-lg bg-indigo-50 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-indigo-800">
                            {bundle.title}
                          </h4>
                          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Bundle ID: {bundle.id}
                          </Badge>
                        </div>

                        <Separator className="my-3 bg-indigo-200" />

                        {/* Bundle Items */}
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-700">
                            Items in this Bundle:
                          </p>
                          {bundle.items.map((item) => {
                            // Determine which object holds the product data (product_item or product)
                            const itemData = item.product_item || item.product;

                            // Determine the main product ID for the link
                            const productId =
                              item.product_id || item.product_item?.product_id;

                            // Determine the name, barcode, and SKU to display
                            const itemName =
                              item.product_item?.product?.name ||
                              item.product?.name;
                            const itemBarcode =
                              item.product_item?.barcode ||
                              item.product?.barcode;
                            const itemSku =
                              item.product_item?.sku || item.product?.sku; // SKU logic

                            const isProductItem = !!item.product_item;

                            // Only render if we have valid item data and a product ID to link to
                            if (!itemData || !productId) return null;

                            return (
                              <Link
                                href={`/products/${productId}`}
                                key={item.id}
                              >
                                <div className="flex items-center justify-between p-3 bg-white border rounded-md transition-shadow hover:shadow-lg">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      {/* Display item name */}
                                      <p className="font-medium text-gray-900">
                                        {itemName}
                                      </p>
                                      {/* Display a badge to distinguish between a product variant (item) and a whole product */}
                                      {isProductItem && (
                                        <span className="text-xs font-semibold text-indigo-500 mr-2">
                                          (Variant)
                                        </span>
                                      )}
                                      {/* Display Barcode */}
                                      <p className="text-xs text-gray-500">
                                        Barcode: {itemBarcode}
                                      </p>
                                      {/* Display SKU */}
                                      <p className="text-xs text-gray-500">
                                        SKU: {itemSku}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <Badge
                                      variant="default"
                                      className={`text-xs ${
                                        item.discount_type === "percentage"
                                          ? "bg-red-500 hover:bg-red-600"
                                          : "bg-teal-500 hover:bg-teal-600"
                                      }`}
                                    >
                                      {item.discount_value}
                                      {item.discount_type === "percentage"
                                        ? "% OFF"
                                        : " ৳ OFF"}
                                    </Badge>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <QuantityDiscountPack quantityDiscounts={quantityDiscounts} />

              {productData?.tags && productData.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-gray-600" />
                      Tags/Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {productData.tags.map((tag, index) => (
                        // Assuming 'tag' is an object with a 'name' property
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm font-normal"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warranty Information */}
              {(productData?.warrenty ||
                productData?.warranties_count ||
                productData?.warranty_id) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Warranty Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productData?.warrenty && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Warranty Type
                          </p>
                          <Badge variant="outline" className="text-sm">
                            {productData.warrenty}
                          </Badge>
                        </div>
                      )}
                      {productData?.warranties_count && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Warranty Period
                          </p>
                          <p className="font-semibold">
                            {productData.warranties_count} Days
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dates Information */}
              {(productData?.manufactory_date ||
                productData?.expiry_date ||
                productData?.created_at) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {productData?.manufactory_date && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Manufacturing Date
                          </p>
                          <p className="font-semibold">
                            {new Date(
                              productData.manufactory_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {productData?.expiry_date && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Expiry Date
                          </p>
                          <p className="font-semibold">
                            {new Date(
                              productData.expiry_date
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {productData?.created_at && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Created Date
                          </p>
                          <p className="font-semibold">
                            {new Date(
                              productData.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {productData?.description &&
                productData.description !== "<p><br></p>" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: productData.description,
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

              {productData?.short_description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Short Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {productData.short_description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
