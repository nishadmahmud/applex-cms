import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import CampaignDataWrapper from "./CampaignDataWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";

const CampaignsPage = async () => {
  return (
    <ProtectedRoute featureName="Ecommerce" optionName="Campaigns">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-4">
              Manage your marketing campaigns efficiently
            </p>
          </div>
          <Link href={"/ecommerce/campaign/add-campaign"}>
            <Button className="w-fit">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
        <Suspense>
          <CampaignDataWrapper />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
