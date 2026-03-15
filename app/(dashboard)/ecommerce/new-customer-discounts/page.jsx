"use client";
import { React, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setToken } from "@/app/store/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetNewCustomerDiscountsQuery,
  useDeleteNewCustomerDiscountMutation,
} from "@/app/store/api/newCustomerDiscountApi";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

const NewCustomerDiscountForm = dynamic(
  () => import("./new-customer-discount-form"),
  { ssr: false }
);
const DeleteDiscountDialog = dynamic(() => import("./delete-dialog"), {
  ssr: false,
});

export default function NewCustomerDiscountPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDiscount, setDeleteDiscount] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features } = useRolePermissions();
  // decide if Add Product visible:
  const hasNewCustomerDiscountAccess =
    !isEmployee || canAccess(features, "Ecommerce", "New Customer Discounts");

  const { data, isLoading, error, refetch } = useGetNewCustomerDiscountsQuery(
    undefined,
    {
      skip: status !== "authenticated" || !hasNewCustomerDiscountAccess,
    }
  );
  const discount = data?.data?.[0] || null;

  const [deleteMutation, { isLoading: isDeleting }] =
    useDeleteNewCustomerDiscountMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation(discount.id).unwrap();
      toast.success("Discount deleted successfully");
      setDeleteDiscount(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  if (status === "loading" || isLoading) return <SkeletonCard />;

  if (error)
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load new customer discount
      </div>
    );

  const formatProductData = (product, discountData) => {
    const productItemId = product.pivot?.product_item_id;
    if (productItemId) {
      // find the matching product item
      const matchedItem = discountData.product_items?.find(
        (item) => item.id === productItemId
      );
      if (matchedItem) {
        return {
          id: matchedItem.id,
          name: matchedItem.product?.name,
          sku: matchedItem.sku,
          image:
            matchedItem.images && matchedItem.images.length > 0
              ? matchedItem.images[0]
              : matchedItem.product?.image_paths?.[0] || null,
          attributes:
            matchedItem.attributes
              ?.map((att) => att.attribute_value?.value)
              .join(", ") || "",
          isVariant: true,
        };
      }
    }
    // fallback to normal product
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      image:
        (Array.isArray(product.image_paths) && product.image_paths.length > 0
          ? product.image_paths[0]
          : null) ||
        product?.image_path ||
        "/placeholder.svg",
      attributes: "",
      isVariant: false,
    };
  };

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="New Customer Discounts">
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">New Customer Discounts</h1>
              <p className="text-muted-foreground text-sm">
                Manage your welcome offers and discounts for new customers
              </p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              + {discount ? "Update" : "Add"}
            </Button>
          </div>

          {/* Card Content */}
          {discount ? (
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {discount.name}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Created at {new Date(discount.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFormOpen(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-8 w-8 p-0"
                    onClick={() => setDeleteDiscount(discount)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discount Amount */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Discount Value:</span>
                  <Badge variant="secondary">
                    {discount.discount_type === "percentage"
                      ? `${discount.discount_amount}%`
                      : `৳${discount.discount_amount}`}
                  </Badge>
                </div>

                {/* Products */}
                <div className="border-t pt-3">
                  <p className="font-semibold mb-2 text-sm">
                    Products ({discount.products?.length || 0})
                  </p>
                  <div className="space-y-2">
                    {(showAll
                      ? discount.products
                      : discount.products?.slice(0, 4)
                    )?.map((prod, idx) => {
                      const mapped = formatProductData(prod, discount);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-muted/50 p-2 rounded cursor-pointer hover:bg-muted/70 transition"
                          onClick={() => {
                            router.push(`/products/${prod.id}`);
                          }}
                        >
                          <img
                            src={mapped.image || "/placeholder.svg"}
                            alt={mapped.name}
                            className="w-10 h-10 rounded object-cover bg-gray-100"
                          />
                          <div className="flex flex-col truncate flex-1">
                            <span className="font-medium truncate">
                              {mapped.name}
                              {mapped.isVariant && (
                                <span className="ml-1 text-blue-600 text-xs">
                                  (Variant)
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {mapped.sku || "N/A"}
                            </span>
                            {mapped.isVariant && mapped.attributes && (
                              <span className="text-xs text-muted-foreground">
                                {mapped.attributes}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {discount.products?.length > 4 && (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => setShowAll((p) => !p)}
                        >
                          {showAll
                            ? "View Less"
                            : `View More (${
                                discount.products.length - 4
                              } more)`}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-64 flex flex-col justify-center items-center">
              <Percent className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No discount created yet — click “Add” to create one.
              </p>
            </Card>
          )}
        </div>

        <NewCustomerDiscountForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleSuccess}
          editingDiscount={discount}
        />
        <DeleteDiscountDialog
          isOpen={!!deleteDiscount}
          onClose={() => setDeleteDiscount(null)}
          onConfirm={handleDelete}
          discountName={deleteDiscount?.name}
          isLoading={isDeleting}
        />
      </div>
    </ProtectedRoute>
  );
}

function SkeletonCard() {
  return (
    <div className="flex justify-center p-12">
      <Card className="w-full max-w-3xl p-6 space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full" />
      </Card>
    </div>
  );
}
