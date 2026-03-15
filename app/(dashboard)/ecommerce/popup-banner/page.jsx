"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageOff, Edit3, PlusCircle, Maximize2, Trash2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  useGetPopupBannerQuery,
  useDeletePopupBannerMutation,
} from "@/app/store/api/popupBannerApi";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

const PopupBannerForm = dynamic(() => import("./popup-banner-form"), {
  ssr: false,
});

export default function PopupBannerPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewer, setViewer] = useState({ open: false, url: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessPopupBanner =
    !isEmployee || canAccess(features, "Ecommerce", "Popup Banner");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessPopupBanner;

  const { data, isLoading, error, refetch } = useGetPopupBannerQuery(
    undefined,
    { skip: status !== "authenticated" || !shouldFetch }
  );

  const popup = data?.data?.[0] || null;
  const [deleteBanner, { isLoading: deleting }] =
    useDeletePopupBannerMutation();

  const handleSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    try {
      await deleteBanner(popup.id).unwrap();
      toast.success("Popup banner deleted successfully!");
      setConfirmOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to delete popup banner");
      console.error(err);
    }
  };

  if (status === "loading" || isLoading) return <SkeletonCard />;

  if (error)
    return (
      <div className="p-6 text-center text-destructive">
        Failed to load popup banners
      </div>
    );

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Popup Banner">
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Popup Banner</h1>
              <p className="text-muted-foreground text-sm">
                Create and manage the site popup banner
              </p>
            </div>
            <div className="flex gap-2">
              {popup && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                {popup ? (
                  <Edit3 className="h-4 w-4" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                {popup ? "Update" : "Add"}
              </Button>
            </div>
          </div>

          {/* Banner display / empty state */}
          {popup ? (
            <Card className="overflow-y-auto shadow-md hover:shadow-lg transition-shadow">
              <div
                className="relative w-full h-60 cursor-pointer group"
                onClick={() => setViewer({ open: true, url: popup.image })}
              >
                <Image
                  src={popup.image}
                  alt={popup.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
                  <h2 className="text-2xl font-bold mb-2 drop-shadow">
                    {popup.title}
                  </h2>
                  <p className="max-w-md text-sm mb-3">{popup.description}</p>
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <a
                      href={popup.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {popup.button_text}
                    </a>
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-white/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                  <Maximize2 className="h-4 w-4 text-gray-700" />
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg font-semibold">Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div>URL: {popup.url}</div>
                <div>
                  Created at: {new Date(popup.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-64 flex flex-col justify-center items-center">
              <ImageOff className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground text-center">
                No popup banner created yet — click “Add” to create one.
              </p>
            </Card>
          )}
        </div>

        {/* Image viewer */}
        {viewer.open && (
          <Dialog
            open={viewer.open}
            onOpenChange={(v) => setViewer({ ...viewer, open: v })}
          >
            <DialogTitle>Popup Banner Image</DialogTitle>
            <DialogContent className="max-w-5xl p-2 sm:p-4 bg-black/80 rounded-md">
              <img
                src={viewer.url}
                alt="popup-full"
                className="w-full h-auto max-h-[85vh] object-contain rounded-md mx-auto"
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirmation */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Delete Popup Banner</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this popup banner? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Form dialog */}
        <PopupBannerForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleSuccess}
          editingBanner={popup}
          token={session?.accessToken}
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
        <Skeleton className="h-52 w-full" />
      </Card>
    </div>
  );
}
