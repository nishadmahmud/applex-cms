"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import useMainHeaderQuery from "@/apiHooks/hooks/useMainHeaderQuery";
import CreateMainHeaderPopup from "./create-main-header-popu";
import EditMainHeaderPopup from "./edit-main-header-popup";
import DeleteConfirmationModal from "./delete-confirmation-modal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

const MainHeadersPage = () => {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;

  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessMainHeader =
    !isEmployee || canAccess(features, "Ecommerce", "Main Header");

  // wait until everything is ready
  const permissionsReady = !permLoading && status !== "loading";
  const shouldEnableQuery = permissionsReady && canAccessMainHeader;

  const {
    data: headers,
    isLoading,
    deleteHeader,
  } = useMainHeaderQuery({ enabled: shouldEnableQuery });
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState(null);

  console.log(headers);

  const handleEdit = (header) => {
    setSelectedHeader(header);
    setShowEditPopup(true);
  };

  const handleDelete = (header) => {
    setSelectedHeader(header);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedHeader) {
      await deleteHeader.mutateAsync(selectedHeader.id);
      setShowDeleteModal(false);
      setSelectedHeader(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Main Header">
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Main Headers</h1>
            <p className="text-gray-600 mt-1">
              Manage your website main headers and navigation
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePopup(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Header
          </Button>
        </div>

        {!headers || headers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  No headers found
                </h3>
                <p className="text-gray-500 mt-1">
                  Get started by creating your first main header
                </p>
              </div>
              <Button
                onClick={() => setShowCreatePopup(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Header
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {headers.map((header, index) => (
              <Card
                key={header.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold truncate">
                      Header #{index + 1}
                    </CardTitle>
                    <Badge variant={header.status ? "default" : "secondary"}>
                      {header.status ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" /> Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div
                    className="w-full h-8 rounded border"
                    style={{ backgroundColor: header.bg_color || "#1A1A1A" }}
                    title={`Background Color: ${header.bg_color || "#1A1A1A"}`}
                  />

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Navigation Items ({header.nav_items?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {header.nav_items?.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {item.icon_path && (
                              <img
                                src={item.icon_path || "/placeholder.svg"}
                                alt={item.name}
                                className="w-4 h-4 object-contain"
                              />
                            )}
                            <span className="font-medium truncate">
                              {item.name}
                            </span>
                          </div>
                          <Badge
                            variant={item.status ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {item.status ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                      {header.nav_items?.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{header.nav_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(header.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(header)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(header)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showCreatePopup && (
          <CreateMainHeaderPopup
            isOpen={showCreatePopup}
            onClose={() => setShowCreatePopup(false)}
          />
        )}

        {showEditPopup && selectedHeader && (
          <EditMainHeaderPopup
            isOpen={showEditPopup}
            onClose={() => {
              setShowEditPopup(false);
              setSelectedHeader(null);
            }}
            header={selectedHeader}
          />
        )}

        {showDeleteModal && selectedHeader && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedHeader(null);
            }}
            onConfirm={confirmDelete}
            title="Delete Header"
            message={`Are you sure you want to delete Header #${selectedHeader.id}? This action cannot be undone.`}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MainHeadersPage;
