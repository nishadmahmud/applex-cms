"use client";
import React, { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useGetUnitsQuery } from "@/app/store/api/unitsApi";
import SettingsSkeleton from "../../SettingsSkeleton";
import dynamic from "next/dynamic";
import { setToken } from "@/app/store/authSlice";
import { useDispatch } from "react-redux";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import ProtectedRoute from "@/components/ProtectedRoute";

const SettingsTemplate = dynamic(
  () => import("@/app/(dashboard)/settings/SettingsTemplate"),
  {
    suspense: true,
  }
);

const Units = () => {
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
  const canAccessUnits =
    !isEmployee || canAccess(features, "Settings", "Units");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessUnits;

  const { data: units, isLoading } = useGetUnitsQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Units"}>
      <div>
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsTemplate
            isLoading={isLoading}
            data={units?.data?.data}
            session={session}
            type="unit"
          />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
};

export default Units;
