"use client";

import { useSession } from "next-auth/react";
import SettingsSkeleton from "../../SettingsSkeleton";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const SettingsTemplate = dynamic(
  () => import("@/app/(dashboard)/settings/SettingsTemplate"),
  {
    suspense: true,
  }
);

const AdditionalInfosForm = dynamic(() => import("./AdditionalInfosForm"), {
  ssr: false,
});

export default function AdditionalInfosPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute featureName={"Products"} optionName={"Add Product"}>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsTemplate
          session={session}
          haveList={false}
          type="additional-infos"
          customComponent={AdditionalInfosForm}
        />
      </Suspense>
    </ProtectedRoute>
  );
}

