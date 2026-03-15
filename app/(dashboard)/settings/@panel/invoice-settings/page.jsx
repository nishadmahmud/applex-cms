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

const InvoiceSettingsForm = dynamic(() => import("./InvoiceSettingsForm"), {
  ssr: false,
});

const InvoiceSettings = () => {
  const { data: session } = useSession();

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Invoice Settings"}>
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsTemplate
          session={session}
          haveList={false} // This will hide the list section
          type="invoice"
          customComponent={InvoiceSettingsForm} // Pass the form component
        />
      </Suspense>
    </ProtectedRoute>
  );
};

export default InvoiceSettings;
