"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useGetWarrantyQuery } from "@/app/store/api/warrantyApi";
// import SettingsTemplate from "../SettingsTemplate"
// import WarrantyModal from "./WarrantyModal"
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import SettingsSkeleton from "../../SettingsSkeleton";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

const SettingsTemplate = dynamic(
  () => import("@/app/(dashboard)/settings/SettingsTemplate"),
  {
    suspense: true,
  }
);

const WarrantyModal = dynamic(() => import("./WarrantyModal"), { ssr: false });

const Warranty = () => {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  const dispatch = useDispatch();
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessWarranty =
    !isEmployee || canAccess(features, "Settings", "Warranty");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessWarranty;

  const { data: warranty, isLoading } = useGetWarrantyQuery(
    {
      page: currentPage,
      limit,
    },
    { skip: status !== "authenticated" || !shouldFetch }
  );

  const totalPage = Math.ceil(warranty?.data?.total / limit) || 0;

  const handleAddWarranty = () => {
    setModalMode("add");
    setSelectedWarranty(null);
    setIsModalOpen(true);
  };

  const handleEditWarranty = (warrantyItem) => {
    setModalMode("edit");
    setSelectedWarranty(warrantyItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWarranty(null);
  };

  // Custom actions for the warranty items
  const warrantyActions = (item) => (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleEditWarranty(item)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 bg-transparent"
        onClick={() => {
          // Handle delete - you can add a confirmation dialog here
          console.log("Delete warranty:", item.id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  // Define columns for warranty table
  const warrantyColumns = [
    {
      header: "Sl.",
      key: "sl",
      width: "w-1/12",
      render: (item, index) => <span>{index + 1}</span>, // ✅ Now index will work
    },
    {
      header: "Name",
      key: "name",
      width: "w-1/4",
    },
    {
      header: "Days",
      key: "warranties_count",
      render: (item) => (
        <span className="font-medium">{item.warranties_count}</span>
      ),
    },
    {
      header: "Created Date",
      accessor: "created_at",
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Warranty"}>
      <div className="pb-5">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTemplate
            // isLoading={isLoading}
            data={warranty?.data}
            session={session}
            haveList={true}
            type={"warranty"}
            customActions={warrantyActions}
            onAddClick={handleAddWarranty}
            addButtonText="Add Warranty"
            columns={warrantyColumns}
          />
        </Suspense>

        <WarrantyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          warranty={selectedWarranty}
          mode={modalMode}
        />

        {/* <CustomPagination
        totalPage={totalPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      /> */}
      </div>
    </ProtectedRoute>
  );
};

export default Warranty;
