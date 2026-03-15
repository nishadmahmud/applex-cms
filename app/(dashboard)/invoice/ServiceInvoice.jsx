/* eslint-disable react/prop-types */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import JsBarcode from "jsbarcode";
import { useGetTermsConditionsQuery } from "@/app/store/api/termsConditionApi";
import { useGetServiceTypesQuery } from "@/app/store/api/serviceTypesApi";
import QRCode from "qrcode";
import ServiceInvoicePdf from "./ServiceInvoicePdf";
import ServiceInvoicePdf2 from "./ServiceInvoicePdf2";
import ServiceInvoicePdf3 from "./ServiceInvoicePdf3";
import ServiceInvoicePdf4 from "./ServiceInvoicePdf4";
import ServiceInvoicePdf2mm from "./ServiceInvoicePdf2mm";
import ServiceInvoicePdf3mm from "./ServiceInvoicePdf3mm";
import ServiceInvoicePadPdf from "./ServiceInvoicePadPdf";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

const numberToWords = (num) => {
  if (!num) return "";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ",
    "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ",
    "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  const n2 = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n2) return "";
  let str = "";
  str += n2[1] != 0 ? (a[Number(n2[1])] || `${b[n2[1][0]]} ${a[n2[1][1]]}`) + "Crore " : "";
  str += n2[2] != 0 ? (a[Number(n2[2])] || `${b[n2[2][0]]} ${a[n2[2][1]]}`) + "Lakh " : "";
  str += n2[3] != 0 ? (a[Number(n2[3])] || `${b[n2[3][0]]} ${a[n2[3][1]]}`) + "Thousand " : "";
  str += n2[4] != 0 ? (a[Number(n2[4])] || `${b[n2[4][0]]} ${a[n2[4][1]]}`) + "Hundred " : "";
  str += n2[5] != 0 ? (str !== "" ? "and " : "") + (a[Number(n2[5])] || `${b[n2[5][0]]} ${a[n2[5][1]]}`) : "";
  return str.trim().toUpperCase();
};

export default function ServiceInvoice({
  service,
  session,
  barcodeRef,
  barcodeId,
  targetRef,
}) {
  const d = service;
  const { data: termsData } = useGetTermsConditionsQuery();
  const { data: serviceTypesData } = useGetServiceTypesQuery();
  const [openMenu, setOpenMenu] = useState(null);

  const serviceTypesList = serviceTypesData?.data || serviceTypesData || [];
  const serviceTypeName =
    serviceTypesList.find((t) => Number(t.id) === Number(d?.service_type_id))?.name ||
    d?.service_type?.name ||
    d?.service_type_name ||
    (d?.service_type_id ? `Type #${d.service_type_id}` : "—");

  const userSettings = session?.user?.invoice_settings || {};
  const userInfo = d?.user_info;
  const settingsFromInvoice = userInfo?.invoice_settings || {};
  const firstCode = userSettings.first_code || settingsFromInvoice.first_code;
  const secondCode = userSettings.second_code || settingsFromInvoice.second_code;

  const invoiceNo = d?.service_invoice_id || d?.invoice_id || "";

  const customer = d?.customers || {};
  const customerName = customer?.name || d?.customer_name || "Walk-in";
  const customerPhone = customer?.mobile_number || customer?.phone || d?.customer_phone || "N/A";
  const customerAddress = customer?.address || "N/A";

  const serviceDetails = d?.service_details || d?.service_products || [];
  const payments = d?.multiple_payment || d?.service_payments || [];

  const fees = Number(d?.fees || 0);
  const vat = Number(d?.vat || 0);
  const tax = Number(d?.tax || 0);
  const discount = Number(d?.discount || 0);
  const total = Number(d?.total || 0);
  const paid = Number(d?.paid_amount || 0);
  const due = Number(d?.due_amount || 0);
  const returnAmount = Number(d?.return_amount || 0);

  const amountInWords = total > 0 ? `${numberToWords(Math.round(total))} TAKA ONLY` : "";

  useEffect(() => {
    if (barcodeRef?.current && barcodeId) {
      JsBarcode(barcodeRef.current, barcodeId, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: false,
      });
    }
  }, [barcodeId, barcodeRef]);

  // ================= PDF BUILD + DOWNLOAD + PRINT =================
  const buildPdfBlob = async (design) => {
    const { pdf } = await import("@react-pdf/renderer");

    const rawLogoUrl =
      d?.user_info?.invoice_settings?.shop_logo ||
      session?.user?.invoice_settings?.shop_logo ||
      d?.user_info?.profile_pic ||
      null;

    const logoUrlForPdf = rawLogoUrl
      ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
      : null;

    const invoiceViewUrl = invoiceNo
      ? `https://pos.outletexpense.com/invoice-view/${invoiceNo}`
      : "https://pos.outletexpense.com";
    const qrDataUrl = await QRCode.toDataURL(invoiceViewUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 120,
    });

    let barcodeDataUrl = null;
    try {
      if (typeof document !== "undefined" && invoiceNo) {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, String(invoiceNo), {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 40,
          displayValue: false,
        });
        barcodeDataUrl = canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.error("Service invoice barcode generation failed:", e);
    }

    const PdfComponent =
      design === "design1"
        ? ServiceInvoicePdf
        : design === "design2"
          ? ServiceInvoicePdf2
          : design === "design3"
            ? ServiceInvoicePdf3
            : design === "design4"
              ? ServiceInvoicePdf4
              : design === "design3mm"
                ? ServiceInvoicePdf3mm
                : design === "design2mm"
                  ? ServiceInvoicePdf2mm
                  : design === "pad"
                    ? ServiceInvoicePadPdf
                    : ServiceInvoicePdf;

    const commonProps = {
      qrDataUrl,
      service: d,
      user: session?.user,
      logoUrl: logoUrlForPdf,
      termsData: termsData?.data || [],
      session,
      serviceTypeName,
      barcodeImage: barcodeDataUrl,
    };

    return await pdf(<PdfComponent {...commonProps} />).toBlob();
  };

  const handleDownload = async (design) => {
    const blob = await buildPdfBlob(design);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoiceNo || "service-invoice"}-${design || "pdf"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setOpenMenu(null);
  };

  const handlePrint = async (design) => {
    try {
      const blob = await buildPdfBlob(design);
      const url = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
        }, 500);
      };
    } catch (e) {
      console.error("Print failed", e);
    } finally {
      setOpenMenu(null);
    }
  };

  return (
    <Card className="py-10 bg-blue-50 border-0 shadow-none">
      {/* ================= MAIN INVOICE (screen view) ================= */}
      <CardContent
        ref={targetRef}
        className="max-w-[794px] min-h-[1123px] pb-10 mx-auto font-sans text-sm bg-white px-0 relative"
      >
        {/* ---- HEADER (Angled Design — same as SaleInvoice) ---- */}
        <div className="relative w-full min-h-[120px] mb-6 overflow-hidden py-4">
          <div
            className="absolute inset-0 z-0 bg-slate-800"
            style={{ backgroundColor: secondCode || "#1e293b" }}
          />
          <div className="absolute -right-24 top-0 w-[60%] h-full bg-white transform skew-x-[35deg] z-10 border-l-[20px] border-white" />

          <div className="absolute inset-0 z-20 flex justify-between items-start pt-4 px-8">
            <div className="flex flex-col">
              <Image
                src={
                  session?.user?.invoice_settings?.shop_logo ||
                  userInfo?.profile_pic ||
                  session?.user?.profile_pic ||
                  "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
                }
                width={70}
                height={70}
                alt="Logo"
                className="object-contain rounded-sm text-transparent"
                unoptimized
              />
            </div>

            <div className="flex flex-col text-right items-end mr-4 mt-2">
              <p className="text-sm text-gray-800 mb-1 flex items-center justify-end gap-2">
                <span className="font-bold">
                  {(() => {
                    const s = session?.user?.invoice_settings;
                    const i = userInfo?.invoice_settings;
                    const u = session?.user || userInfo;
                    const mobiles = [
                      s?.mobile_number || i?.mobile_number,
                      s?.additional_mobile_number || i?.additional_mobile_number,
                    ].filter(Boolean);
                    if (mobiles.length > 0) return mobiles.join(" / ");
                    return u?.phone || "N/A";
                  })()}
                </span>
                <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" className="w-3 h-3" alt="phone" />
              </p>
              <p className="text-sm text-gray-800 mb-1 flex items-center justify-end gap-2">
                <span>{userSettings.email || settingsFromInvoice.email || userInfo?.email}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" className="w-3 h-3" alt="email" />
              </p>
              <p className="text-sm text-gray-800 flex items-center justify-end gap-2 max-w-[250px]">
                <span>{userSettings.shop_address || settingsFromInvoice.shop_address || userInfo?.address}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="w-3 h-3" alt="location" />
              </p>
            </div>
          </div>
        </div>

        {/* Header Bottom Border */}
        <div className="relative w-full h-5 mb-8">
          <div className="absolute left-0 top-0 h-1 w-[40%]" style={{ backgroundColor: secondCode || "#1e293b" }} />
          <div className="absolute right-0 top-0 h-1 w-[75%]" style={{ backgroundColor: firstCode || "#a9d0b8" }} />
          <div className="absolute -right-2 top-1 w-[160px] h-4 bg-white transform skew-x-[35deg] border-l-[20px] border-white" />
        </div>

        {/* TITLE + CUSTOMER INFO */}
        <div className="px-8 mb-6">
          <h2 className="text-center font-bold text-xl mb-4 border-y border-gray-300 py-2">
            SERVICE INVOICE
          </h2>
          <div className="flex justify-between text-sm">
            <div className="w-[40%]">
              <h3 className="font-bold text-gray-600 mb-1">Customer</h3>
              <p className="font-bold text-base">{customerName}</p>
              <p>Contact: {customerPhone}</p>
            </div>
            <div className="w-[25%]">
              <h3 className="font-bold text-gray-600 mb-1">Address</h3>
              <p>{customerAddress}</p>
            </div>
            <div className="w-[35%] text-right flex flex-col items-end">
              <div className="mb-2 flex flex-col items-end">
                {barcodeRef && <svg ref={barcodeRef} className="w-40 h-10" />}
                {invoiceNo && (
                  <span className="mt-1 text-xs font-semibold tracking-wide">{invoiceNo}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Date: {d?.created_at ? new Date(d.created_at).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* SERVICE INFO */}
        <div className="px-8 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm border border-gray-200 rounded p-3 bg-gray-50">
            <div>
              <p className="text-xs font-semibold text-gray-500">Service Type</p>
              <p className="font-medium">{serviceTypeName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Status</p>
              <p className="font-medium">{d?.status || "Pending"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Issue Description</p>
              <p className="font-medium">{d?.issue_description || "—"}</p>
            </div>
            {d?.checking_description && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500">Checking Description</p>
                <p className="font-medium">{d.checking_description}</p>
              </div>
            )}
            {d?.servicing_description && (
              <div>
                <p className="text-xs font-semibold text-gray-500">Servicing Description</p>
                <p className="font-medium">{d.servicing_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="mb-8 px-7">
          <Table className="border border-gray-400 border-collapse w-full text-[13px]">
            <TableHeader>
              <TableRow className="p-0 border-b border-gray-400 bg-gray-100">
                <TableHead className="w-[5%] text-center border-r border-gray-400 font-bold h-auto py-0.5">N°</TableHead>
                <TableHead className="w-[40%] border-r border-gray-400 font-bold h-auto py-0.5">DESCRIPTION(CODE)</TableHead>
                <TableHead className="w-[10%] text-center border-r border-gray-400 font-bold h-auto py-0.5">UNITS</TableHead>
                <TableHead className="w-[25%] border-r border-gray-400 font-bold h-auto py-0.5">TECHNICIANS</TableHead>
                <TableHead className="w-[20%] text-right font-bold h-auto py-0.5">FEES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceDetails.map((item, i) => (
                <TableRow key={item.id || i} className="border-b border-gray-200 align-top">
                  <TableCell className="text-center border-r border-gray-200 py-0.5">{i + 1}</TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5">
                    <div className="font-semibold">
                      {item.product_info?.name || `Product #${item.product_id}`}
                    </div>
                    {item.product_info?.barcode && (
                      <div className="text-[11px] text-gray-600 mt-0.5 italic">
                        Barcode: {item.product_info.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200 py-0.5">{item.servicing_unit} Pcs</TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5">
                    {(item.technician_list || item.technicians || []).map((t) => t.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold py-0.5">{i === 0 ? fmt(fees) : "—"}</TableCell>
                </TableRow>
              ))}
              {serviceDetails.length === 0 && (
                <TableRow className="border-b border-gray-200">
                  <TableCell className="text-center border-r border-gray-200 py-0.5">1</TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5 font-semibold">Service Charge</TableCell>
                  <TableCell className="text-center border-r border-gray-200 py-0.5">—</TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5">—</TableCell>
                  <TableCell className="text-right py-0.5">{fmt(fees)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* TRANSACTION DETAILS + TOTALS */}
        <div className="px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-300 bg-gray-50">
              <div className="text-center font-semibold text-[13px] border-b border-gray-300 py-1">TRANSACTION DETAILS</div>
              <div className="p-3 space-y-2">
                {payments.length > 0 ? (
                  payments.map((pay, i) => (
                    <div key={i} className="flex items-center justify-between border border-gray-200 rounded px-2 py-1 text-[13px] bg-white">
                      <span>{pay?.payment_type?.type_name || "Payment"}</span>
                      <span className="font-semibold">{fmt(pay.payment_amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between border border-gray-200 rounded px-2 py-1 text-[13px] bg-white">
                    <span>Cash</span>
                    <span className="font-semibold">{fmt(paid)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-300">
              {vat > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">VAT</span>
                  <span>{fmt(vat)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">Service Charge</span>
                  <span>{fmt(tax)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">Discount</span>
                  <span>(-) {fmt(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 bg-gray-100">
                <span className="font-semibold text-[13px] uppercase">Gross Total</span>
                <span className="font-bold text-[14px]">{fmt(total)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                <span className="font-semibold text-gray-700">Paid Amount</span>
                <span className="font-semibold">{fmt(paid)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 text-[13px] bg-gray-50">
                <span className="font-semibold">Outstanding</span>
                <span className={`font-semibold ${due > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmt(due)}</span>
              </div>
              {returnAmount > 0 && (
                <div className="flex items-center justify-between px-3 py-1 text-[13px] bg-gray-50 border-t border-gray-200">
                  <span className="font-semibold text-blue-600">Return Amount</span>
                  <span className="font-semibold text-blue-600">{fmt(returnAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {amountInWords && (
            <div className="mt-6">
              <div className="border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Amount in words</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{amountInWords}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h3 className="text-base mb-2 font-bold">TERMS & CONDITIONS</h3>
              <ul className="space-y-1 text-[13px] text-gray-700">
                {termsData?.data?.map((terms, idx) => (
                  <li key={idx}>• {terms?.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 w-full h-[45px] overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full h-[22px] z-0"
            style={{ backgroundColor: secondCode || "#1e293b" }}
          />
          <div
            className="absolute bottom-[14px] left-[40px] right-[40px] h-[18px] transform -skew-x-[12deg] z-10 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: firstCode || "#a9d0b8" }}
          >
            <span className="font-bold text-[10px] tracking-[1.5px] text-[#0E6B57] transform skew-x-[12deg] uppercase font-sans">
              {userInfo?.web_address || session?.user?.web_address || "www.commeriva.com"}
            </span>
          </div>
        </div>
      </CardContent>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        <div className="relative inline-block">
          <Button
            variant="outline"
            className="flex items-center bg-transparent"
            onClick={() => setOpenMenu(openMenu === "download" ? null : "download")}
          >
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>

          {openMenu === "download" && (
            <div className="absolute left-0 mt-2 bottom-10 w-40 rounded-md border bg-white shadow-lg z-50">
              <button onClick={() => handleDownload("design1")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 1</button>
              <button onClick={() => handleDownload("design2")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 2</button>
              <button onClick={() => handleDownload("design3")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 3</button>
              <button onClick={() => handleDownload("design4")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 4</button>
              <button onClick={() => handleDownload("design3mm")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 3 (3 mm)</button>
              <button onClick={() => handleDownload("design2mm")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Design 2 (2 mm)</button>
            </div>
          )}
        </div>

        <div className="relative inline-block ml-2">
          <Button
            variant="outline"
            className="flex items-center bg-transparent"
            onClick={() => setOpenMenu(openMenu === "print" ? null : "print")}
          >
            <Printer className="w-4 h-4 mr-1" />
            Print PDF
          </Button>

          {openMenu === "print" && (
            <div className="absolute left-0 bottom-10 mt-2 w-40 rounded-md border bg-white shadow-lg z-50">
              <button onClick={() => handlePrint("design1")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print 1</button>
              <button onClick={() => handlePrint("design2")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print 2</button>
              <button onClick={() => handlePrint("design3")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print 3</button>
              <button onClick={() => handlePrint("design4")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print 4</button>
              <button onClick={() => handlePrint("design3mm")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print (3 mm)</button>
              <button onClick={() => handlePrint("design2mm")} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">Print (2 mm)</button>
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={() => handlePrint("pad")}
          variant="outline"
          className="flex items-center bg-transparent"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print (Pad)
        </Button>
      </div>
    </Card>
  );
}
