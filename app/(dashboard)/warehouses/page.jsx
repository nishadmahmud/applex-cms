"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
} from "lucide-react";
import WarehouseFormModal from "./WarehouseFormModal";
import { cn } from "@/lib/utils";
import {
  useActivateWarehouse,
  useDeactivateWarehouse,
  useWarehouseList,
} from "@/apiHooks/hooks/useWareHouseFeatureQuery";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function WarehousePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isEmployee = !!session?.isEmployee;

  const { data: features } = useRolePermissions(); // only queries when employee
  const activateWarehouse = useActivateWarehouse();
  const deactivateWarehouse = useDeactivateWarehouse();

  const {
    data: warehouses = [],
    isLoading,
    isError,
  } = useWarehouseList(userId);

  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filtered = warehouses?.filter((w) =>
    w?.name?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const normalizeStatus = (status) => {
    if (!status) return "inactive";
    const s = String(status).toLowerCase();
    return s === "1" || s === "active" ? "active" : "inactive";
  };

  const handleToggleStatus = (warehouse) => {
    const normalized = normalizeStatus(warehouse.status);
    if (normalized === "active") {
      deactivateWarehouse.mutate(warehouse.id);
    } else {
      activateWarehouse.mutate(warehouse.id);
    }
  };

  // 🧠 Permission gates: only matter if employee
  const canView =
    !isEmployee || canAccess(features, "Warehouse", "Warehouse View");
  const canCreate =
    !isEmployee || canAccess(features, "Warehouse", "Warehouse Create");
  const canEdit =
    !isEmployee || canAccess(features, "Warehouse", "Warehouse Edit");
  const canActivate =
    !isEmployee || canAccess(features, "Warehouse", "Warehouse Activate");
  const canDeactivate =
    !isEmployee || canAccess(features, "Warehouse", "Warehouse Deactivate");

  return (
    <ProtectedRoute featureName="Warehouse">
      <div className="container mx-auto py-6 space-y-6">
        <Card className="shadow-sm border">
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Warehouse Management
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search warehouses..."
                  className="pl-8 w-60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Add button only for creators */}
              {canCreate && (
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={() => {
                    setSelectedWarehouse(null);
                    setIsFormOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Warehouse
                </Button>
              )}
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-6 w-6 text-violet-500" />
              </div>
            ) : isError ? (
              <p className="text-center py-10 text-red-500">
                Failed to load warehouses
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No warehouses found
              </p>
            ) : (
              // Show table only if allowed
              canView && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-violet-50 border-b text-left text-gray-600 font-medium">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Address</th>
                        <th className="px-4 py-2">Contact</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((warehouse, idx) => {
                        const status = normalizeStatus(warehouse.status);
                        return (
                          <tr
                            key={warehouse.id || idx}
                            className={cn(
                              "border-b hover:bg-violet-50 transition duration-150"
                            )}
                          >
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2 font-semibold text-gray-800">
                              {warehouse.name || "—"}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                              {warehouse.address || "—"}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2 text-gray-700">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  {warehouse.email || "—"}
                                </span>
                                <span className="flex items-center gap-2 text-xs text-gray-500">
                                  <Phone className="h-3.5 w-3.5" />
                                  {warehouse.phone || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-semibold capitalize",
                                  status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center flex justify-center gap-2">
                              {/* Edit permission */}
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-violet-600 border-violet-200 hover:bg-violet-50"
                                  onClick={() => {
                                    setSelectedWarehouse(warehouse);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {/* Delete placeholder */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-400 border-gray-200 cursor-not-allowed"
                                disabled
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {/* Activate/Deactivate control */}
                              {status === "active" && canDeactivate && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(warehouse)}
                                  disabled={deactivateWarehouse.isPending}
                                  className="border text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  <ToggleLeft className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                              )}
                              {status !== "active" && canActivate && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStatus(warehouse)}
                                  disabled={activateWarehouse.isPending}
                                  className="border text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <ToggleRight className="h-4 w-4 mr-1" />
                                  Activate
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal only for allowed roles */}
        {(canCreate || canEdit) && (
          <WarehouseFormModal
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            warehouse={selectedWarehouse}
            userId={userId}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
