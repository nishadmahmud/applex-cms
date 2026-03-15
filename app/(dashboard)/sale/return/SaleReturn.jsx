"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SaleReturnInvoice from "./SaleReturnInvoice";
import useSaleReturnDetails from "@/apiHooks/hooks/useSaleReturnInvoiceQuery";

const SaleReturn = () => {
  const params = useParams();
  const invoiceId = params?.slug; 

  const { data: session } = useSession();

  // Use hook correctly
  const { saleReturnDetails } = useSaleReturnDetails(invoiceId);
  const { data, isLoading, error } = saleReturnDetails;

  console.log("invoiceId:", invoiceId);
  console.log("sale return api response:", data);

  if (isLoading) return  <div className="flex flex-col gap-4 h-screen justify-center justify-items-center items-center py-10">
      <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    <h2 className="text-gray-700 font-medium">Loading sales return invoice...</h2>
    </div>;
  if (error || !data?.data)
    return <div>Not found or error loading sale return.</div>;

  const saleReturn = data?.data;

  return (
    <div className="p-4">
      <SaleReturnInvoice
        saleReturn={saleReturn}
        session={session}
        barcodeId={saleReturn?.return_id}
      />
    </div>
  );
};

export default SaleReturn;