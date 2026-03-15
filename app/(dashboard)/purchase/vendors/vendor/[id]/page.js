"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useGetVendorDueCollectionQuery,
  useGetVendorDueInvoiceListQuery,
} from "@/app/store/api/dueInvoiceList";
import CustomerVendorProfile from "@/components/CustomerVendorProfile";
import CustomerVendorStats from "@/components/CustomerVendorStats";
import CustomerVendorPurchaseProduct from "@/components/CustomerVendorPurchaseProduct";
import CustomerVendorInvoiceHistory from "@/components/CustomerVendorInvoiceHistory";
import {
  useGetVendorProfileQuery,
  useGetVendorWiseInvoiceQuery,
  useGetVendorWiseProductQuery,
} from "@/app/store/api/purchaseVendorApi";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const interval = searchParams.get("interval");
  const [activeTab, setActiveTab] = useState(interval);

  useEffect(() => {
    if (status === "authenticated") dispatch(setToken(session.accessToken));
  }, [status, dispatch, session]);

  const { data: customer } = useGetVendorProfileQuery(
    { id, interval: activeTab },
    { skip: !activeTab || status !== "authenticated" }
  );

  const { data: customerWiseProduct } = useGetVendorWiseProductQuery(
    {
      id,
      interval: activeTab,
    },
    { skip: status !== "authenticated" }
  );
  const { data: customerWiseInvoice } = useGetVendorWiseInvoiceQuery(
    {
      id,
      interval: activeTab,
    },
    { skip: status !== "authenticated" }
  );

  const { data: dueCollection } = useGetVendorDueCollectionQuery(
    { id },
    { skip: !id || status !== "authenticated" }
  );
  const { data: dueInvoiceList } = useGetVendorDueInvoiceListQuery(
    { id },
    { skip: !id || status !== "authenticated" }
  );

  const handleIntervals = (tab) => {
    setActiveTab(tab);
    router.push(`/purchase/vendors/vendor/${id}?interval=${tab}`);
  };

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-gray-50 p-2">
        <div className="space-y-6">
          {/* Time Period Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(tab) => handleIntervals(tab)}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Customer Profile Sidebar */}
                <CustomerVendorProfile
                  dueCollection={dueCollection}
                  dueInvoiceList={dueInvoiceList}
                  partyData={customer}
                  party_id={id}
                />

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Customer History Header */}
                  <CustomerVendorStats partyData={customer} />

                  {/* Most Purchase Products Slider*/}
                  <CustomerVendorPurchaseProduct
                    partyWiseProduct={customerWiseProduct}
                  />

                  {/* Invoice History */}
                  <CustomerVendorInvoiceHistory
                    partyWiseInvoice={customerWiseInvoice}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Suspense>
  );
}
