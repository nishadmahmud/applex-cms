"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useGetBrandsQuery } from "@/app/store/api/brandsApi";
import CustomPagination from "@/app/utils/CustomPagination";
import dynamic from "next/dynamic";
import SettingsSkeleton from "../../SettingsSkeleton";
import ProtectedRoute from "@/components/ProtectedRoute";
import { setToken } from "@/app/store/authSlice";
import { useDispatch } from "react-redux";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

const SettingsTemplate = dynamic(
  () => import("@/app/(dashboard)/settings/SettingsTemplate"),
  {
    suspense: true,
  }
);

const BrandsPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  // Only allow query once permissions are known AND user is allowed
  const canAccessBrands =
    !isEmployee || canAccess(features, "Settings", "Brands");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessBrands;

  const { data: brands, isLoading } = useGetBrandsQuery(
    {
      page: currentPage,
      limit,
    },
    { skip: status !== "authenticated" || !shouldFetch }
  );

  const totalPage = Math.ceil(brands?.data?.total / limit) || 0;

  // Define columns for brands table
  const brandsColumns = [
    {
      header: "Sl.",
      key: "sl",
      width: "w-1/12",
      render: (item, index) => (
        <span>{(currentPage - 1) * limit + index + 1}</span>
      ),
    },
    {
      header: "Logo",
      key: "image_path",
      render: (item) =>
        item.image_path ? (
          <img
            src={item.image_path}
            alt="Brand"
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
    {
      header: "Banner",
      key: "banner_image",
      render: (item) =>
        item.banner_image ? (
          <img
            src={item.banner_image}
            alt="Banner"
            className="w-16 h-10 rounded object-cover border"
          />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
    {
      header: "Name",
      key: "name",
    },
    {
      header: "Description",
      key: "description",
      render: (item) => (
        <span className="font-medium">{item.description || "N/A"}</span>
      ),
    },
    {
      header: "Top Brand?",
      key: "is_topbrand",
      render: (item) => (
        <span className="text-sm text-gray-700">
          {item.is_topbrand == 1 ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Brands"}>
      <div className="pb-5">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTemplate
            isLoading={isLoading}
            data={brands?.data?.data}
            session={session}
            formHref={"/settings/brands/add-brands"}
            columns={brandsColumns}
          />
        </Suspense>
        <CustomPagination
          totalPage={totalPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </ProtectedRoute>
  );
};

export default BrandsPage;
