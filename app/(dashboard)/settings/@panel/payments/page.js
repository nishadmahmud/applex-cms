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

import Image from "next/image";
import ProfileSection from "../../ProfileSection";
import { useGetPaymentListQuery } from "@/app/store/api/paymentApi";
import Modal from "@/app/utils/Modal";
import ViewInterface from "./ViewInterface";
import EditInterface from "./EditInterface";
import DeleteInterface from "./DeleteInterface";
import CreateInterface from "./CreateInterface";
import ListSkeleton from "../../ListSkeleton";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

//   {
//     id: 1,
//     code: "B",
//     name: "Bkash",
//     type: "Mobile Banking",
//     status: "active",
//     icon: Smartphone,
//     color: "bg-pink-500",
//     image: "/placeholder.svg?height=40&width=40",
//   },
//   {
//     id: 2,
//     code: "D",
//     name: "DBBL",
//     type: "Bank",
//     status: "active",
//     icon: Building2,
//     color: "bg-blue-600",
//     image: "/placeholder.svg?height=40&width=40",
//   },
//   {
//     id: 3,
//     code: "C",
//     name: "City",
//     type: "Bank",
//     status: "active",
//     icon: Building2,
//     color: "bg-green-600",
//     image: "/placeholder.svg?height=40&width=40",
//   },
//   {
//     id: 4,
//     code: "বা",
//     name: "বগুড়া",
//     type: "Bank",
//     status: "inactive",
//     icon: Building2,
//     color: "bg-orange-500",
//     image: "/placeholder.svg?height=40&width=40",
//   },
//   {
//     id: 5,
//     code: "C",
//     name: "Cash",
//     type: "Physical",
//     status: "active",
//     icon: Banknote,
//     color: "bg-emerald-600",
//     image: "/placeholder.svg?height=40&width=40",
//   },
//   {
//     id: 6,
//     code: "T",
//     name: "Test",
//     type: "Testing",
//     status: "inactive",
//     icon: CreditCard,
//     color: "bg-gray-500",
//     image: "/placeholder.svg?height=40&width=40",
//   },
// ];

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
  const canAccessPayments =
    !isEmployee || canAccess(features, "Settings", "Payments");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessPayments;

  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState({});
  const [deleteModal, setDeleteModal] = useState({});
  const [editModal, setEditModal] = useState({});
  const { data: paymentMethods, isLoading } = useGetPaymentListQuery(
    undefined,
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

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Payments"}>
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
                      Payment Methods
                    </h1>
                    <p className="text-sm text-slate-600 font-normal">
                      Manage your payment options
                    </p>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
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
                      {paymentMethods?.data?.data?.length}
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
                        paymentMethods?.data?.data?.filter(
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
                      {paymentMethods?.data?.data?.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods List */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {!paymentMethods?.data?.data && isLoading ? (
                  <ListSkeleton total={5} />
                ) : paymentMethods?.data?.data &&
                  paymentMethods?.data?.data?.length ? (
                  paymentMethods.data.data.map((method) => {
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

                            {/* Method Image */}
                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                              <Image
                                src={method?.icon_image || "/placeholder.svg"}
                                alt={method?.type_name}
                                width={50}
                                height={50}
                                className="w-8 h-8 object-contain"
                              />
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
                              <div className="flex items-center gap-2 mt-1">
                                {/* <IconComponent className="h-4 w-4 text-slate-500" /> */}
                                {method?.type_name !== "Cash" ? (
                                  <Building2 className="h-4 w-4 text-slate-500" />
                                ) : (
                                  <Banknote className="h-4 w-4 text-slate-500" />
                                )}
                                <p className="text-sm text-slate-600">
                                  {method?.type_name !== "Cash"
                                    ? "Bank"
                                    : "Physical"}
                                </p>
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
                              content={<ViewInterface method={method} />}
                              title={"Payment Method Details"}
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
                                <EditInterface
                                  method={method}
                                  onClose={() =>
                                    setEditModal((prev) => ({
                                      ...prev,
                                      [method.id]: false,
                                    }))
                                  }
                                />
                              }
                              title={"Edit Payment Method"}
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
                                <DeleteInterface
                                  method={method}
                                  onClose={() =>
                                    setDeleteModal((prev) => ({
                                      ...prev,
                                      [method.id]: false,
                                    }))
                                  }
                                />
                              }
                              title={"Delete Payment Method"}
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
            content={<CreateInterface onClose={() => setCreateModal(false)} />}
            title={"Add Payment Method"}
            open={createModal}
            onClose={() => setCreateModal(false)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
