"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import usePurchaseReturnDetails from "@/apiHooks/hooks/usePurchaseReturnInvoiceQuery";
import PurchaseReturnInvoice from "./PurchaseReturnInvoice";

const PurchaseReturn = () => {
  const params = useParams();
  const invoiceId = params?.slug; 

  const { data: session } = useSession();

  // Use hook correctly
  const { purchaseReturnDetails } = usePurchaseReturnDetails(invoiceId);
  const { data, isLoading, error } = purchaseReturnDetails;

  console.log("invoiceId:", invoiceId);
  console.log("purchase return api response:", data);

  if (isLoading) return  <div className="flex flex-col gap-4 h-screen justify-center justify-items-center items-center py-10">
      <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    <h2 className="text-gray-700 font-medium">Loading purchases return invoice...</h2>
    </div>;
  if (error || !data?.data)
    return <div>Not found or error loading purchase return.</div>;

  const purchaseReturn = data?.data;

  return (
    <div className="p-4">
      <PurchaseReturnInvoice
        purchaseReturn={purchaseReturn}
        session={session}
        barcodeId={purchaseReturn?.return_id}
      />
    </div>
  );
};

export default PurchaseReturn;