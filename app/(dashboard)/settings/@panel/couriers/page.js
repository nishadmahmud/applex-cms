"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Building2,
  Banknote,
  Edit3,
} from "lucide-react";

import ProfileSection from "../../ProfileSection";
import Modal from "@/app/utils/Modal";
import ListSkeleton from "../../ListSkeleton";
import { useGetDeliveryListQuery } from "@/app/store/api/deliveryApi";
import ViewUi from "./ViewUi";
import DeleteUi from "./DeleteUi";
import EditUi from "./EditUi";
import CreateUi from "./CreateUi";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PaymentManagement() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessCouriers =
    !isEmployee || canAccess(features, "Settings", "Couriers");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessCouriers;

  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState({});
  const [deleteModal, setDeleteModal] = useState({});
  const [editModal, setEditModal] = useState({});
  const { data: deliveryMethods, isLoading } = useGetDeliveryListQuery(
    {
      page: 1,
      limit: 20,
    },
    { skip: status !== "authenticated" || !shouldFetch }
  );

  const handleAdd = () => {
    setCreateModal(!createModal);
  };

  const handleView = (methodid) => {
    setViewModal((prev) => ({
      ...prev,
      [methodid]: true,
    }));
  };

  const handleEdit = (methodid) => {
    setEditModal((prev) => ({
      ...prev,
      [methodid]: true,
    }));
  };

  const handleDelete = (methodid) => {
    setDeleteModal((prev) => ({
      ...prev,
      [methodid]: true,
    }));
  };

  console.log(deliveryMethods);

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Couriers"}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <ProfileSection />
        <div className="mt-10 mx-auto space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                      Delivery Methods
                    </h1>
                    <p className="text-sm text-slate-600 font-normal">
                      Manage your delivery options
                    </p>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Delivery Method
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Active Methods</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {deliveryMethods?.data?.data?.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Inactive Methods</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {
                        deliveryMethods?.data?.data?.filter(
                          (m) => m.status === "inactive"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Methods</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {deliveryMethods?.data?.data?.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* delivery Methods List */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {!deliveryMethods?.data?.data && isLoading ? (
                  <ListSkeleton total={5} />
                ) : deliveryMethods?.data?.data &&
                  deliveryMethods?.data?.data?.length ? (
                  deliveryMethods.data.data.map((method) => {
                    return (
                      <div
                        key={method?.id}
                        className="p-6 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Method Icon/Code */}
                            <div
                              className={`w-12 h-12 bg-[#58C17E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                            >
                              {method?.icon_letter}
                            </div>

                            {/* Method Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-slate-800 text-lg">
                                  {method?.type_name}
                                </h3>
                                {/* <Badge className={getStatusColor(method?.status)}>
                              {method?.status}
                            </Badge> */}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(method.id)}
                              className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(method.id)}
                              className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(method.id)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>

                            {/* Modals */}
                            {/* view modal */}
                            <Modal
                              content={<ViewUi method={method} />}
                              title={"Delivery Method Details"}
                              open={viewModal[method.id]}
                              onClose={() =>
                                setViewModal((prev) => ({
                                  ...prev,
                                  [method.id]: false,
                                }))
                              }
                            />

                            {/* edit modal */}
                            <Modal
                              Icon={Edit3}
                              content={
                                <EditUi
                                  method={method}
                                  onClose={() =>
                                    setEditModal((prev) => ({
                                      ...prev,
                                      [method.id]: false,
                                    }))
                                  }
                                />
                              }
                              title={"Edit Delivery Method"}
                              open={editModal[method.id]}
                              onClose={() =>
                                setEditModal((prev) => ({
                                  ...prev,
                                  [method.id]: false,
                                }))
                              }
                            />

                            {/* delete modal */}
                            <Modal
                              content={
                                <DeleteUi
                                  method={method}
                                  onClose={() =>
                                    setDeleteModal((prev) => ({
                                      ...prev,
                                      [method.id]: false,
                                    }))
                                  }
                                />
                              }
                              title={"Delete Delivery Method"}
                              open={deleteModal[method.id]}
                              onClose={() =>
                                setDeleteModal((prev) => ({
                                  ...prev,
                                  [method.id]: false,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* method creation modal */}
          <Modal
            Icon={Edit3}
            content={<CreateUi onClose={() => setCreateModal(false)} />}
            title={"Add Delivery Method"}
            open={createModal}
            onClose={() => setCreateModal(false)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
