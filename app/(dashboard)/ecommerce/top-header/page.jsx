"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

import { TopBarList } from "./top-bar-list";
import { CreateTopBarForm } from "./create-top-bar-form";
import { EditTopBarForm } from "./edit-top-bar-form";
import { DeleteConfirmDialog } from "./delete-confirmation-dialog";
import useTopbars from "@/apiHooks/hooks/useTopHeaderQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function TopHeaderPage() {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessTopHeader =
    !isEmployee || canAccess(features, "Ecommerce", "Top Header");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessTopHeader;

  // 👇 pass enabled flag
  const {
    data: topbarsData,
    isLoading,
    isError,
    error,
  } = useTopbars({
    enabled: shouldFetch,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const topbars = topbarsData?.topbars || [];
  const bg_color = topbarsData?.settings?.bg_color || "#ff0220";

  const handleCreate = () => {
    setIsCreateOpen(true);
  };

  const handleEdit = (topbar) => {
    setEditData(topbar);
    setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
  };

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Top Header">
      <div className="container mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Top Headers
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-muted-foreground">Loading...</p>}
            {isError && <p className="text-red-500">{error.message}</p>}
            {!isLoading && !isError && (
              <TopBarList
                topbars={topbars}
                bg_color={bg_color}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Topbar</DialogTitle>
            </DialogHeader>
            <CreateTopBarForm
              onClose={() => setIsCreateOpen(false)}
              bg_color={bg_color}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Topbar</DialogTitle>
            </DialogHeader>
            <EditTopBarForm
              onClose={() => setIsEditOpen(false)}
              data={editData}
              bg_color={bg_color}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
          id={selectedId}
        />
      </div>
    </ProtectedRoute>
  );
}
