"use client";

import { React, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

import useFooter from "@/apiHooks/hooks/useFooterQuery";
import AddFooterPopup from "./add-footer-popop";
import DeleteConfirmationModal from "./delete-confrimation-modal";
import EditFooterPopup from "./edit-footer-popup";
import ReorderNavItemsPopup from "./reorder-navItems-popup";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function FootersPage() {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();
  // Only allow query once permissions are known AND user is allowed
  const canAccessTopHeader =
    !isEmployee || canAccess(features, "Ecommerce", "Footer");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessTopHeader;

  const {
    data: footersData,
    isLoading,
    error,
    reorderNavItems,
  } = useFooter({
    enabled: shouldFetch,
  });
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFooter, setSelectedFooter] = useState(null);
  const [showReorderPopup, setShowReorderPopup] = useState(false);

  const handleEdit = (footer) => {
    setSelectedFooter(footer);
    setShowEditPopup(true);
  };

  const handleDelete = (footer) => {
    setSelectedFooter(footer);
    setShowDeleteModal(true);
  };

  const handleClosePopups = () => {
    setShowAddPopup(false);
    setShowEditPopup(false);
    setShowDeleteModal(false);
    setSelectedFooter(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading footers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading footers</div>
        </div>
      </div>
    );
  }

  const footers = footersData?.footers || [];

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Footer">
      <div className="container mx-auto p-2 space-y-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-balance">
              Footer Management
            </h1>
            <p className="text-muted-foreground">
              Manage your website footers and navigation items
            </p>
          </div>
          <Button
            onClick={() => setShowAddPopup(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Footer
          </Button>
        </div>

        {/* Footers Grid */}
        {footers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No footers found</h3>
                <p className="text-muted-foreground">
                  Create your first footer to get started
                </p>
                <Button onClick={() => setShowAddPopup(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Footer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footers.map((footer) => (
              <Card key={footer.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg text-balance">
                        {footer.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground text-pretty">
                        {footer.description}
                      </p>
                    </div>
                    <Badge variant={footer.status ? "default" : "secondary"}>
                      {footer.status ? (
                        <Eye className="w-3 h-3 mr-1" />
                      ) : (
                        <EyeOff className="w-3 h-3 mr-1" />
                      )}
                      {footer.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Background Color Preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Background:
                    </span>
                    <div
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: footer.bg_color }}
                    />
                    <span className="text-sm font-mono">{footer.bg_color}</span>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Navigation Items:
                      </span>
                      <Button
                        className="text-[10px] p-2"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFooter(footer);
                          setShowReorderPopup(true);
                        }}
                      >
                        Reorder
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {footer.nav_items?.length > 0 ? (
                        footer.nav_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                          >
                            <span className="font-medium">{item.name}</span>
                            <Badge
                              variant={item.status ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {item.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No navigation items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(footer)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(footer)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        <AddFooterPopup open={showAddPopup} onClose={handleClosePopups} />
        <EditFooterPopup
          open={showEditPopup}
          onClose={handleClosePopups}
          footer={selectedFooter}
        />
        <DeleteConfirmationModal
          open={showDeleteModal}
          onClose={handleClosePopups}
          footer={selectedFooter}
        />
        <ReorderNavItemsPopup
          open={showReorderPopup}
          onClose={() => setShowReorderPopup(false)}
          footer={selectedFooter}
          onReorder={(id, nav_items) =>
            reorderNavItems.mutate({ id, nav_items })
          }
        />
      </div>
    </ProtectedRoute>
  );
}
