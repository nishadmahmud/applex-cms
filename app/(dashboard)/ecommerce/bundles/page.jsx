"use client";

import { React, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setToken } from "@/app/store/authSlice";
import {
  useGetBundlesQuery,
  useDeleteBundleMutation,
} from "@/app/store/api/bundlesApi";
import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

const BundleForm = dynamic(() => import("./bundle-form"), { ssr: false });
const DeleteConfirmDialog = dynamic(() => import("./delete-dialog"), {
  ssr: false,
});

export default function BundlesPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [deleteBundle, setDeleteBundle] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // 🔍 Search State and Debounce Logic
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms debounce delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Set token when session is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  // Fetch bundles data
  const {
    data: bundlesData,
    isLoading,
    error,
    refetch,
  } = useGetBundlesQuery(undefined, {
    skip: status !== "authenticated",
  });

  const allBundles = bundlesData?.bundles || [];

  // Filter bundles by search term
  const bundles = allBundles.filter((bundle) =>
    bundle.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const [deleteBundleMutation, { isLoading: isDeleting }] =
    useDeleteBundleMutation();

  const handleAddBundle = () => {
    setEditingBundle(null);
    setIsFormOpen(true);
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle(bundle);
    setIsFormOpen(true);
  };

  const handleDeleteBundle = async (bundleId) => {
    try {
      await deleteBundleMutation(bundleId).unwrap();
      toast.success("Bundle deleted successfully");
      setDeleteBundle(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete bundle");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBundle(null);
    refetch();
  };

  if (status === "loading" || isLoading) {
    return <BundlesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load bundles</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Bundles">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-balance">Product Bundles</h1>
            <p className="text-muted-foreground text-pretty">
              Create and manage product bundles with special discounts
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="Search bundles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </div>

            {/* Add Bundle Button */}
            <Button
              onClick={handleAddBundle}
              className="gap-2 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Add Bundle
            </Button>
          </div>
        </div>

        {/* Bundles Grid */}
        {bundles.length === 0 ? (
          debouncedSearch ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  No bundles match "{debouncedSearch}"
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bundles found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by creating your first product bundle
                </p>
                <Button onClick={handleAddBundle} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Bundle
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <Card
                key={bundle.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bundle.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBundle(bundle)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteBundle(bundle)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    {bundle.items?.length || 0} products •
                    <span className="flex items-center gap-1">
                      Status:{" "}
                      <Badge
                        className={
                          bundle.status === 1
                            ? "bg-green-500 text-white hover:bg-green-600 capitalize"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 capitalize"
                        }
                      >
                        {bundle.status === 1 ? "active" : "inactive"}
                      </Badge>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bundle.description && (
                      <p className="text-xs text-muted-foreground">
                        {bundle.description}
                      </p>
                    )}
                    <div>
                      <Separator className="my-2" />
                      <p className="text-sm font-semibold mb-2">Products:</p>
                      <div className="space-y-2">
                        {(showAll
                          ? bundle.items
                          : bundle.items?.slice(0, 3)
                        )?.map((item) => {
                          const isProductItem = !!item.product_item_id;
                          const displayData = isProductItem
                            ? {
                                id: item.product_item?.product?.id,
                                name: item.product_item?.product?.name,
                                sku: item.product_item?.sku,
                                image:
                                  Array.isArray(item.product_item?.images) &&
                                  item.product_item.images.length > 0
                                    ? item.product_item.images[0]
                                    : null,
                                attributes: item.product_item?.attributes
                                  ?.map((attr) => attr.attribute_value?.value)
                                  .join(", "),
                              }
                            : {
                                id: item.product?.id,
                                name: item.product?.name,
                                sku: item.product?.sku,
                                image: item.product?.image_paths?.[0] || null,
                                attributes: null,
                              };

                          return (
                            <Link
                              href={`/products/${displayData.id}`}
                              key={item.id}
                              className="block"
                            >
                              <div className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                                {/* Left: image + name + SKU */}
                                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                  <Image
                                    src={
                                      displayData.image || "/gadcheap-02.png"
                                    }
                                    alt={displayData.name || "Product"}
                                    width={32}
                                    height={32}
                                    className="rounded object-cover bg-gray-100"
                                  />
                                  <div className="flex flex-col truncate">
                                    <span className="font-medium truncate">
                                      {displayData.name}
                                      {isProductItem && (
                                        <span className="ml-1 text-blue-600">
                                          (Variant)
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      SKU: {displayData.sku || "N/A"}
                                    </span>
                                    {isProductItem &&
                                      displayData.attributes && (
                                        <span className="text-[11px] text-muted-foreground">
                                          {displayData.attributes}
                                        </span>
                                      )}
                                  </div>
                                </div>

                                {/* Right: discount badge */}
                                <Badge
                                  variant="secondary"
                                  className="text-xs ml-2 shrink-0"
                                >
                                  {item.discount_type === "percentage"
                                    ? `${item.discount_value}%`
                                    : `৳${item.discount_value}`}
                                </Badge>
                              </div>
                            </Link>
                          );
                        })}

                        {bundle.items?.length > 3 && (
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => setShowAll((prev) => !prev)}
                            >
                              {showAll
                                ? "View Less"
                                : `View More (${bundle.items.length - 3} more)`}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bundle Form Modal */}
        <BundleForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          editingBundle={editingBundle}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={!!deleteBundle}
          onClose={() => setDeleteBundle(null)}
          onConfirm={() => handleDeleteBundle(deleteBundle?.id)}
          isLoading={isDeleting}
          bundleName={deleteBundle?.title}
        />
      </div>
    </ProtectedRoute>
  );
}

function BundlesPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
