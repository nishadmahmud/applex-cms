"use client";

import { React, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Tag, ArrowLeft } from "lucide-react";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@/apiHooks/hooks/useCouponsQuery";
import { CouponListItem } from "@/app/(dashboard)/ecommerce/coupons/coupon-list-item";
import { CouponForm } from "@/app/(dashboard)/ecommerce/coupons/coupon-form";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const { data: couponsResponse, isLoading, error, refetch } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = couponsResponse?.data?.data || [];

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.coupon_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.coupon_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCoupon = async (data) => {
    try {
      await createCoupon.mutateAsync(data);
      setCurrentView("list");
      toast.success("Coupon created successfully!");
      await refetch();
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  const handleUpdateCoupon = async (data) => {
    if (!selectedCoupon) return;
    try {
      await updateCoupon.mutateAsync({ id: selectedCoupon.id, data });
      setCurrentView("list");
      setSelectedCoupon(null);
      toast.success("Coupon updated successfully!");
      await refetch();
    } catch (error) {
      console.error("Error updating coupon:", error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success("Coupon deleted successfully!");
      await refetch();
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setCurrentView("edit");
  };

  const handleCreateClick = () => {
    setSelectedCoupon(null);
    setCurrentView("create");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedCoupon(null);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading coupons. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === "create" || currentView === "edit") {
    const isEdit = currentView === "edit";
    return (
      <div className="container mx-auto py-1 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {isEdit ? "Edit Coupon" : "Create New Coupon"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit
                ? `Update coupon details for "${selectedCoupon?.coupon_name}"`
                : "Create a new discount coupon for your customers"}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="gap-2 bg-gray-100 hover:bg-gray-200 font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Coupons
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponForm
              coupon={isEdit ? selectedCoupon : undefined}
              onSubmit={isEdit ? handleUpdateCoupon : handleCreateCoupon}
              isLoading={
                isEdit ? updateCoupon.isPending : createCoupon.isPending
              }
              submitLabel={isEdit ? "Update Coupon" : "Create Coupon"}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Coupons">
      <div className="container mx-auto py-1 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Coupon Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your discount coupons and promotional codes
            </p>
          </div>
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Coupons ({filteredCoupons.length})</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading coupons...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No coupons found matching your search."
                    : "No coupons created yet."}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={handleCreateClick}
                    className="mt-4 bg-transparent"
                    variant="outline"
                  >
                    Create Your First Coupon
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-0">
                <div className="grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 py-3 border-b-2 border-border font-semibold text-sm text-muted-foreground">
                  <div>Sl.</div>
                  <div>Name & Code</div>
                  <div>Targeted User</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Expires</div>
                  <div className="text-center">Created</div>
                  <div className="text-right">Actions</div>
                </div>
                {filteredCoupons.map((coupon, index) => (
                  <CouponListItem
                    index={index + 1}
                    key={coupon.id}
                    coupon={coupon}
                    onEdit={handleEditCoupon}
                    onDelete={handleDeleteCoupon}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
