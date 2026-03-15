import React, { Suspense } from "react";
import EditCampaignWrapper from "./EditCampaignWrapper";
import { FormSkeleton } from "./FormSkeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

// eslint-disable-next-line react/prop-types
export default async function EditCampaignPage({ params }) {
  const { id } = await params;

  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Campaigns">
      <div>
        <Suspense fallback={<FormSkeleton />}>
          <EditCampaignWrapper id={id} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
