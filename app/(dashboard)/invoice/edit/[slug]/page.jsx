"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import SalePurchaseBilling from "@/app/(dashboard)/sale/billing/page";

export default function EditInvoicePage() {
  const { slug } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // detect invoice type
  const isPurchaseEdit = slug.startsWith("PUR-");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const url = isPurchaseEdit
          ? "/purchase-invoice-details"
          : "/invoice-details";
        const { data } = await api.post(url, { invoice_id: slug });
        setInvoiceData(data?.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [slug]);

  if (loading) return <div className="p-6 text-center">Loading invoice...</div>;
  if (!invoiceData)
    return (
      <div className="p-6 text-center text-red-500">Invoice not found</div>
    );

  return (
    <SalePurchaseBilling
      editMode
      initialInvoice={invoiceData}
      key={slug} // ensure full refresh per invoice
    />
  );
}
