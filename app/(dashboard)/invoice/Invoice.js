"use client";
import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { useGetInvoiceDeatilsQuery } from "@/app/store/api/invoiceSettingsApi";
import { useGetServiceDetailsQuery } from "@/app/store/api/servicesApi";
import { Loader2 } from "lucide-react";
import { usePDF } from "react-to-pdf";
import JsBarcode from "jsbarcode";
import { pdf } from "@react-pdf/renderer";
import SaleInvoice from "./SaleInvoice";
import PurchaseInvoice from "./PurchaseInvoice";
import ServiceInvoice from "./ServiceInvoice";
import SaleInvoicePdf from "./SaleInvoicePdf1";

export default function Invoice() {
  const params = useParams();
  const invoiceId = params?.slug;
  const isPurchase = invoiceId?.startsWith("PUR-");
  const isService = invoiceId?.startsWith("SERVICE-");

  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  // SET USER TOKEN INTO REDUX
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      dispatch(setToken(session.accessToken));
    }
  }, [session, status, dispatch]);

  // BARCODE + PDF
  const barcodeRef = useRef(null);
  const barcodeLastSegment = invoiceId?.split("-")?.pop();

  const { toPDF, targetRef } = usePDF({
    filename: `${invoiceId}.pdf`,
    page: { margin: 0, format: "A4", orientation: "portrait" },
    canvas: { scale: 2, useCORS: true, letterRendering: true },
  });

  // FETCH INVOICE / SERVICE DATA
  const {
    data: invoice,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
  } = useGetInvoiceDeatilsQuery(
    { invoice_id: invoiceId },
    { skip: status !== "authenticated" || isService }
  );

  const {
    data: service,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useGetServiceDetailsQuery(invoiceId, {
    skip: status !== "authenticated" || !isService,
  });

  // GENERATE BARCODE
  useEffect(() => {
    if (barcodeRef.current && barcodeLastSegment) {
      JsBarcode(barcodeRef.current, `${barcodeLastSegment}`, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: false,
      });
    }
  }, [barcodeLastSegment]);

  // EXPORT SALE INVOICE PDF (REACT-PDF RENDER)
  const handleSalePDFExport = async () => {
    const blob = await pdf(
      <SaleInvoicePdf
        invoice={invoice}
        barcodeId={barcodeLastSegment}
        user={session?.user}
        qrImage="/qr.jpg"
        barcodeRef={barcodeRef}
        barcodeImage="/qr.jpg"
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const isLoading = isService ? isServiceLoading : isInvoiceLoading;
  const hasError = isService
    ? isServiceError || !service?.data
    : isInvoiceError || !invoice?.data;

  // LOADING
  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 mb-3 text-blue-600 animate-spin" />
          <p className="text-gray-700 font-medium">Loading invoice details…</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-semibold">
        Failed to load invoice details.
      </div>
    );
  }

  // IF SERVICE INVOICE
  if (isService) {
    return (
      <ServiceInvoice
        service={service?.data}
        session={session}
        barcodeId={barcodeLastSegment}
        barcodeRef={barcodeRef}
        targetRef={targetRef}
      />
    );
  }

  // IF PURCHASE INVOICE
  if (isPurchase) {
    return (
      <PurchaseInvoice
        invoice={invoice?.data}
        session={session}
        barcodeId={barcodeLastSegment}
        barcodeRef={barcodeRef}
        targetRef={targetRef}
        toPDF={toPDF}
      />
    );
  }

  // IF SALES INVOICE
  return (
    <SaleInvoice
      invoice={invoice}
      session={session}
      barcodeId={barcodeLastSegment}
      barcodeRef={barcodeRef}
      targetRef={targetRef}
      toPDF={handleSalePDFExport}
    />
  );
}
