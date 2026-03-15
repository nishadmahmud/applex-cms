"use client";

import { React, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setToken } from "@/app/store/authSlice";
import {
  useDeleteAttributeMutation,
  useGetAttributeListQuery,
} from "@/app/store/api/attributesApi";
import dynamic from "next/dynamic";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";
// import AttributeForm from "./attribute-form";
// import DeleteConfirmDialog from "./delete-confirm-dialog";

const AttributeForm = dynamic(() => import("./attribute-form"), { ssr: false });
const DeleteConfirmDialog = dynamic(() => import("./delete-confirm-dialog"), {
  ssr: false,
});

export default function AttributesPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [deleteAttribute, setDeleteAttribute] = useState(null);

  // Set token when session is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessAttributes =
    !isEmployee || canAccess(features, "Settings", "Attributes");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessAttributes;

  // Fetch attributes data
  const {
    data: attributes = [],
    isLoading,
    error,
    refetch,
  } = useGetAttributeListQuery(
    { page: 1, limit: 1000 },
    {
      skip: status !== "authenticated" || !shouldFetch,
    }
  );

  const [deleteAttributeMutation, { isLoading: isDeleting }] =
    useDeleteAttributeMutation();

  const handleAddAttribute = () => {
    setEditingAttribute(null);
    setIsFormOpen(true);
  };

  const handleEditAttribute = (attribute) => {
    setEditingAttribute(attribute);
    setIsFormOpen(true);
  };

  const handleDeleteAttribute = async (attributeId) => {
    try {
      await deleteAttributeMutation(attributeId).unwrap();
      toast.success("Attribute deleted successfully");
      setDeleteAttribute(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete attribute");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAttribute(null);
    refetch();
  };

  if (status === "loading" || isLoading) {
    return <AttributesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load attributes</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Attributes"}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-balance">
              Product Attributes
            </h1>
            <p className="text-muted-foreground text-pretty">
              Manage product attributes and their values for your inventory
            </p>
          </div>
          <Button onClick={handleAddAttribute} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        {/* Attributes Grid */}
        {attributes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No attributes found
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first product attribute
              </p>
              <Button onClick={handleAddAttribute} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Attribute
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {attributes.map((attribute) => (
              <Card
                key={attribute.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {attribute.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAttribute(attribute)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteAttribute(attribute)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    {/* Show attribute type */}
                    <span className="flex items-center gap-1">
                      Type:{" "}
                      <Badge variant="outline" className="capitalize">
                        {attribute.type || "N/A"}
                      </Badge>
                    </span>
                    •{/* Show attribute status */}
                    <span className="flex items-center gap-1">
                      Status:{" "}
                      <Badge
                        className={
                          attribute.status === "active"
                            ? "bg-green-500 text-white hover:bg-green-600 capitalize"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 capitalize"
                        }
                      >
                        {attribute.status}
                      </Badge>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Values: {attribute.values?.length || 0}{" "}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attribute.values?.slice(0, 6).map((value) => (
                          <Badge
                            key={value.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {value.value}
                          </Badge>
                        ))}
                        {attribute.values?.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{attribute.values.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Attribute Form Modal */}
        <AttributeForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          editingAttribute={editingAttribute}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={!!deleteAttribute}
          onClose={() => setDeleteAttribute(null)}
          onConfirm={() => handleDeleteAttribute(deleteAttribute?.id)}
          isLoading={isDeleting}
          attributeName={deleteAttribute?.name}
        />
      </div>
    </ProtectedRoute>
  );
}

function AttributesPageSkeleton() {
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
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
