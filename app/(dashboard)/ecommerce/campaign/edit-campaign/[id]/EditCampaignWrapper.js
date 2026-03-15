import { authOption } from "@/app/api/auth/[...nextauth]/route";
import { getCampaign } from "@/lib/getCampaigns";
import { getServerSession } from "next-auth";
import React from "react";
import EditCampaign from "./EditCampaign";

// eslint-disable-next-line react/prop-types
export default async function EditCampaignWrapper({ id }) {
  const session = await getServerSession(authOption);
  const data = getCampaign(id, session.accessToken);
  return (
    <div>
        <EditCampaign id={id} campaignPromise={data} />
    </div>
  );
}
