/* eslint-disable react/prop-types */
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Barcode from "react-barcode";
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
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import JsBarcode from "jsbarcode";
import { useGetTermsConditionsQuery } from "@/app/store/api/termsConditionApi";
import QRCode from "qrcode";
import { pdf } from "@react-pdf/renderer";
import PurchaseInvoicePdf1 from "./PurchaseInvoicePdf1";
import PurchaseInvoicePdf2 from "./PurchaseInvoicePdf2";
import PurchaseChallanPdf from "./PurchaseChallanPdf";
import { formatBangladeshiAmount } from "@/lib/format-display-bdt";

export default function PurchaseInvoice({ invoice, session, barcodeId }) {
  const targetRef = useRef(null);
  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const [qrImage, setQrImage] = useState(null);
  const [barcodeImage] = useState(null);
  const { data: termsData } = useGetTermsConditionsQuery();
  const terms = termsData?.data || [];
  const [openMenu, setOpenMenu] = React.useState(null);

  const userSettings = session?.user?.invoice_settings || {};
  const userInfo = invoice?.user_info;
  const settingsFromInvoice = userInfo?.invoice_settings || {};
  const firstCode = userSettings.first_code || settingsFromInvoice.first_code;
  const secondCode = userSettings.second_code || settingsFromInvoice.second_code;

  // 🏪 Store-specific flag — Dizmo (id 265 / 353 or name match)
  const isDizmo =
    session?.user?.id === 265 ||
    session?.user?.id === 353 ||
    session?.user?.outlet_name?.toLowerCase()?.includes("dizmo") ||
    userInfo?.id === 265 ||
    userInfo?.id === 353 ||
    userInfo?.outlet_name?.toLowerCase()?.includes("dizmo");

  // ---------- Calculations ----------
  const purchaseDetails = invoice?.purchase_details || [];
  const subTotal = Number(invoice?.sub_total || 0);
  const discount = Number(invoice?.discount || 0);
  const paid = Number(invoice?.paid_amount || 0);
  const finalTotal = subTotal - discount;
  const due = Math.max(finalTotal - paid, 0);

  // ---------- Amount in words ----------
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
    const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str += n[1] != 0 ? (a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`) + "Crore " : "";
    str += n[2] != 0 ? (a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`) + "Lakh " : "";
    str += n[3] != 0 ? (a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`) + "Thousand " : "";
    str += n[4] != 0 ? (a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`) + "Hundred " : "";
    str += n[5] != 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`) : "";
    return str.trim().toUpperCase();
  };

  const amountInWords = finalTotal > 0
    ? `${numberToWords(Math.round(finalTotal))} TAKA ONLY`
    : "";

  // Generate barcode for screen
  useEffect(() => {
    if (barcodeRef.current && barcodeId) {
      JsBarcode(barcodeRef.current, barcodeId, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 50,
        displayValue: false,
      });
    }
  }, [barcodeId]);

  // Get QR image as dataURL for PDF
  useEffect(() => {
    if (qrCanvasRef.current) {
      try {
        const dataURL = qrCanvasRef.current.toDataURL("image/png");
        setQrImage(dataURL);
      } catch (e) {
        console.error("QR toDataURL error:", e);
      }
    }
  }, [session]);

  const formatProductName = (item) => {
    let name = item?.product_info?.name || "Unnamed Product";

    if (
      item?.product_info?.have_product_variant ||
      item?.have_product_variant ||
      item?.product_variant
    ) {
      const variant = item?.product_variant;
      if (variant?.name) {
        name += ` - ${variant.name}`;
      }
      const childVariant = item?.child_product_variant;
      if (childVariant?.name) {
        name += ` - ${childVariant.name}`;
      }
    }

    const imeis = item?.product_imei;
    if (Array.isArray(imeis) && imeis.length > 0) {
      const first = imeis[0];
      const parts = [];
      if (first.color) parts.push(`Color: ${first.color}`);
      if (first.storage) parts.push(`Storage: ${first.storage}`);
      if (first.region) parts.push(`Region: ${first.region}`);
      if (parts.length > 0) {
        name += ` (${parts.join(" | ")})`;
      }
    }

    return name;
  };

  /* ---------------- React-PDF: build blob for download/preview/print ---------------- */

  const buildPdfBlob = async (design) => {
    // dynamic import fixes "Cannot read properties of null (reading 'write')"
    const { pdf } = await import("@react-pdf/renderer");

    const rawLogoUrl = invoice?.user_info?.invoice_settings?.shop_logo || null;

    const logoUrlForPdf = rawLogoUrl
      ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
      : null;

    const invoiceViewUrl =
      `https://pos.outletexpense.com/invoice-view/${invoice?.custom_invoice_id || invoice?.invoice_id || ""}`.trim() ||
      "https://pos.outletexpense.com";
    const qrDataUrl = await QRCode.toDataURL(invoiceViewUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 120,
    });

    // Generate Barcode on the fly for PDF
    let barcodeDataUrl = null;
    try {
      if (typeof document !== "undefined" && barcodeId) {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, barcodeId, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: false,
        });
        barcodeDataUrl = canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.error("Barcode generation failed:", e);
    }

    const PdfComponent =
      design === "design1" ? PurchaseInvoicePdf1 : PurchaseInvoicePdf2;

    return await pdf(
      <PdfComponent
        qrDataUrl={qrDataUrl}
        invoice={invoice}
        user={session?.user}
        qrImage={qrImage}
        barcodeImage={barcodeDataUrl}
        terms={terms}
        termsData={terms}
        logoUrl={logoUrlForPdf}
      />,
    ).toBlob();
  };

  const handleDownload = async (design) => {
    const blob = await buildPdfBlob(design);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${design}.pdf`;
    a.click();

    URL.revokeObjectURL(url);
    setOpenMenu(null);
  };

  const handlePrint = async (design) => {
    try {
      const blob = await buildPdfBlob(design);
      const url = URL.createObjectURL(blob);

      // Create invisible iframe for direct print
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      // Wait for load then print
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

  /* ---------------- Pad print: print only body without header/footer design ---------------- */
  const padRef = useRef();

  const handlePadPrint = useCallback(() => {
    try {
      if (!padRef.current) return;

      const content = padRef.current.innerHTML;
      const w = window.open("", "PRINT", "height=900,width=1200");
      if (!w) return;

      w.document.write(`
        <html>
          <head>
            <title>Purchase Invoice Pad</title>
            <style>
              * {
                box-sizing: border-box;
                font-family: ui-sans-serif, system-ui, -apple-system,
                  Segoe UI, Roboto, sans-serif;
              }
              @page { margin: 20mm; }
              html, body { height: 100%; margin: 0; padding: 0; }
              body { font-size: 12px; color: #000; }
              .page { min-height: 100vh; display: flex; flex-direction: column; }
              .content { flex: 1 0 auto; }
              .footer-fixed {
                flex-shrink: 0; text-align: center; font-size: 11px;
                font-weight: 700; margin-top: 10px; padding-top: 6px;
                border-top: 1px solid #000;
              }
              .invoice-header { display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 16px; align-items: flex-start; padding-bottom: 10px; padding-top: 10px; margin-bottom: 12px; }
              .header-left { font-weight: 700; margin-bottom: 4px; font-size: 15px; }
              .hlabel { font-weight: 700; margin-bottom: 4px; font-size: 17px; }
              .customer-name { font-weight: 600; font-size: 14px; }
              .header-left .meta { font-size: 12px; margin-top: 4px; }
              .header-center { text-align: start; }
              .invoice-title { font-size: 18px; font-weight: 700; letter-spacing: 1px; text-align: center; color: #8f8e8c; border-top: 1px solid #8f8e8c; border-bottom: 1px solid #8f8e8c; padding: 6px 0; margin: 0 auto 10px auto; margin-top: 6rem; }
              .address-block .label { font-weight: 700; }
              .address-block .value { font-size: 12px; margin-top: 2px; }
              .header-right { text-align: right; font-size: 12px; }
              .barcode { width: 10px; margin-bottom: 6px; }
              .invoice-info div { line-height: 1.4; }
              .invoice-table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 12px; }
              .invoice-table thead th { background-color: #f3f4f6; border: 1px solid #000; padding: 6px 8px; font-weight: 600; }
              .invoice-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .text-center { text-align: center; }
              .imei-text { font-size: 11px; color: #555; margin-top: 2px; }
              .bottom-row { display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; }
              .terms-container { flex: 1; }
              .summary-container { flex: 0 0 260px; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .summary-label { font-weight: 600; }
              .summary-value { font-weight: 500; }
              .due .summary-value { color: #b91c1c; font-weight: 700; }
              ul { margin: 0; padding-left: 18px; }
              li { margin-bottom: 2px; }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="content">
                ${content}
              </div>
              <div class="footer-fixed">
                ${session?.user?.invoice_settings?.purchase_condition || ""}
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      w.document.close();
    } catch (err) {
      console.error("Error printing pad:", err);
      alert("Error printing pad. Please try again.");
    }
  }, [session?.user?.invoice_settings?.purchase_condition]);

  return (
    <Card className="py-10 bg-blue-50 border-0 shadow-none">
      {/* ================= MAIN INVOICE (for screen – Print 2 layout) ================= */}
      <CardContent
        ref={targetRef}
        className="max-w-[794px] min-h-[1123px] pb-10 mx-auto font-sans text-sm bg-white px-0 relative"
      >
        {/* Hidden QR canvas used only for PDF image data */}
        <div style={{ position: "absolute", top: -9999, left: -9999 }}>
          <QRCodeCanvas
            ref={qrCanvasRef}
            value={session?.user?.invoice_settings?.qr_value || " "}
            size={120}
          />
        </div>

        {/* ---- HEADER (Angled Design like Print 2) ---- */}
        <div className="relative w-full min-h-[120px] mb-6 overflow-visible py-4">
          {/* Base Background (Dark) */}
          <div
            className="absolute inset-0 z-0 bg-slate-800"
            style={{ backgroundColor: secondCode || "#1e293b" }}
          />

          {/* White Angled Cut */}
          <div className="absolute -right-24 top-0 w-[60%] h-full bg-white transform skew-x-[35deg] z-10 border-l-[20px] border-white" />

          {/* Content Container */}
          <div className="absolute inset-0 z-20 flex justify-between items-start pt-4 px-8">
            {/* LEFT: LOGO (on colored bg) */}
            {isDizmo ? (
              // 🏪 Dizmo: logo fills the entire left colored section (absolute, out of flex flow)
              <>
                <div className="absolute left-0 top-0 h-full w-[42%] z-30 flex items-stretch">
                  <Image
                    src={
                      session?.user?.invoice_settings?.shop_logo ||
                      session?.user?.profile_pic ||
                      "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
                    }
                    width={300}
                    height={120}
                    alt="Dizmo Logo"
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                {/* Spacer to push shop-info to the right white section */}
                <div className="w-[42%] shrink-0" />
              </>
            ) : (
              <div className="flex flex-col">
                <Image
                  src={
                    session?.user?.invoice_settings?.shop_logo ||
                    session?.user?.profile_pic ||
                    "/placeholder-logo.png"
                  }
                  width={70}
                  height={70}
                  alt="Logo"
                  className="object-contain rounded-sm text-transparent"
                />
              </div>
            )}

            {/* RIGHT: SHOP INFO (on white bg) */}
            <div className="flex flex-col text-right items-end mr-4 mt-2">
              <p className="text-sm text-gray-800 mb-1 flex items-center justify-end gap-2">
                <span className="font-bold">
                  {(() => {
                    const s = session?.user?.invoice_settings;
                    const i = invoice?.user_info?.invoice_settings;
                    const mobiles = [
                      s?.mobile_number || i?.mobile_number,
                      s?.additional_mobile_number || i?.additional_mobile_number,
                    ].filter(Boolean);
                    if (mobiles.length > 0) return mobiles.join(" / ");
                    return session?.user?.phone || "N/A";
                  })()}
                </span>
                <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" className="w-3 h-3" alt="phone" />
              </p>
              <p className="text-sm text-gray-800 mb-1 flex items-center justify-end gap-2">
                <span>{userSettings.email || settingsFromInvoice.email}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" className="w-3 h-3" alt="email" />
              </p>
              <p className="text-sm text-gray-800 flex items-center justify-end gap-2 max-w-[250px]">
                <span>{userSettings.shop_address || settingsFromInvoice.shop_address}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="w-3 h-3" alt="location" />
              </p>
            </div>
          </div>
        </div>

        {/* Header Bottom Border (Angled Strip) */}
        <div className="relative w-full h-5 mb-8">
          <div className="absolute left-0 top-0 h-1 w-[40%]" style={{ backgroundColor: secondCode || "#1e293b" }} />
          <div className="absolute right-0 top-0 h-1 w-[75%]" style={{ backgroundColor: firstCode || "#a9d0b8" }} />
          <div className="absolute -right-2 top-1 w-[160px] h-4 bg-white transform skew-x-[35deg] border-l-[20px] border-white" />
        </div>

        {/* VENDOR INFO ROW */}
        <div className="px-8 mb-6">
          <h2 className="text-center font-bold text-xl mb-4 border-y border-gray-300 py-2">PURCHASE INVOICE</h2>
          <div className="flex justify-between text-sm">
            {/* Left: Vendor */}
            <div className="w-[40%]">
              <h3 className="font-bold text-gray-600 mb-1">Vendor</h3>
              <p className="font-bold text-base">{invoice?.vendor_name || "N/A"}</p>
              <p>Contact: {invoice?.vendor_phone || "N/A"}</p>
              <p>Address: {invoice?.vendor?.address || "N/A"}</p>
            </div>

            {/* Middle: Payment */}
            <div className="w-[25%]">
              <h3 className="font-bold text-gray-600 mb-1">Payment</h3>
              <p>{invoice?.pay_mode || "N/A"}</p>
            </div>

            {/* Right: Invoice Info */}
            <div className="w-[35%] text-right flex flex-col items-end">
              <div className="mb-2 flex flex-col items-end">
                {barcodeRef && (
                  <svg
                    ref={barcodeRef}
                    className="w-40 h-10"
                  />
                )}
                {invoice?.invoice_id && (
                  <span className="mt-1 text-xs font-semibold tracking-wide">
                    {invoice.invoice_id}
                  </span>
                )}
              </div>
              <p className="mb-1">{invoice?.custom_invoice_id}</p>
              <p className="text-xs text-gray-500">
                Date: {invoice?.created_at ? new Date(invoice.created_at).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCT TABLE (Print 2 style) */}
        <div className="mb-8 px-7">
          <Table className="border border-gray-400 border-collapse w-full text-[13px]">
            <TableHeader>
              <TableRow className="p-0 border-b border-gray-400 bg-gray-100">
                <TableHead className="w-[5%] text-center border-r border-gray-400 font-bold">
                  N°
                </TableHead>
                <TableHead className="w-[45%] border-r border-gray-400 font-bold">
                  DESCRIPTION(CODE)
                </TableHead>
                <TableHead className="w-[15%] text-right border-r border-gray-400 font-bold">
                  PRICE
                </TableHead>
                <TableHead className="w-[10%] text-center border-r border-gray-400 font-bold">
                  QTY
                </TableHead>
                <TableHead className="w-[10%] text-center border-r border-gray-400 font-bold">
                  DIS
                </TableHead>
                <TableHead className="w-[15%] text-right font-bold">
                  TOTAL
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {purchaseDetails.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-b border-gray-200 align-top"
                >
                  <TableCell className="text-center border-r border-gray-200">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r border-gray-200">
                    <div className="font-semibold">
                      {formatProductName(item)}
                    </div>
                    {Array.isArray(item.product_imei) &&
                      item.product_imei.length > 0 ? (
                      <div className="text-[11px] text-gray-600 mt-0.5 italic">
                        IMEI: {item.product_imei[0].imei}
                      </div>
                    ) : item.product_info?.barcode ? (
                      <div className="text-[11px] text-gray-600 mt-0.5 italic">
                        Barcode: {item.product_info.barcode}
                      </div>
                    ) : null}
                    {item?.product_item_id && (
                      <div className="text-[11px] text-gray-500 mt-0.5 italic">
                        Variant: {item?.product_items?.sku || ""} {item?.product_items?.barcode ? `· Barcode: ${item.product_items.barcode}` : ""}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right border-r border-gray-200">
                    {Number(item.price || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200">
                    {item.qty} Pcs
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200">
                    -
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* BOTTOM SECTION – Transaction + Totals */}
        <div className="px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="border border-gray-300 bg-gray-50">
              <div className="text-center font-semibold text-[13px] border-b border-gray-300 py-1">
                TRANSACTION DETAILS
              </div>
              <div className="p-3 space-y-2">
                {invoice?.multiple_payments?.length > 0 ? (
                  invoice.multiple_payments.map((pay, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-gray-200 rounded px-2 py-1 text-[13px] bg-white"
                    >
                      <span>{pay?.payment_type?.type_name || "Payment"}</span>
                      <span className="font-semibold">
                        {Number(pay.payment_amount || 0).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between border border-gray-200 rounded px-2 py-1 text-[13px] bg-white">
                    <span>{invoice?.pay_mode || "Cash"}</span>
                    <span className="font-semibold">
                      {paid.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border border-gray-300">
              {discount > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">Discount</span>
                  <span>
                    (-){discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 bg-gray-100">
                <span className="font-semibold text-[13px] uppercase">
                  Gross Total
                </span>
                <span className="font-bold text-[14px]">
                  {finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                <span className="font-semibold text-gray-700">
                  Paid Amount
                </span>
                <span className="font-semibold">
                  {paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 text-[13px] bg-gray-50">
                <span className="font-semibold">Outstanding</span>
                <span
                  className={`font-semibold ${due > 0 ? "text-red-600" : "text-emerald-600"}`}
                >
                  {due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* AMOUNT IN WORDS */}
          {amountInWords && (
            <div className="mt-6">
              <div className="border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Amount in words
                </p>
                <p className="text-sm font-bold text-gray-900 uppercase">
                  {amountInWords}
                </p>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          <div className="mt-6 flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h3 className="text-base mb-2 font-bold">TERMS & CONDITIONS</h3>
              <ul className="space-y-1 text-[13px] text-gray-700">
                {terms.map((t, idx) => (
                  <li key={idx}>• {t?.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER (screen only) - Exact PDF2 Replica */}
        <div className="mt-10 w-full h-[45px] overflow-hidden">
          {/* Dark Bar (Bottom 22px) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[22px] z-0"
            style={{ backgroundColor: secondCode || "#1e293b" }}
          />

          {/* Accent Angled Band */}
          <div
            className="absolute bottom-[14px] left-[40px] right-[40px] h-[18px] transform -skew-x-[12deg] z-10 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: firstCode || "#a9d0b8" }}
          >
            <span className="font-bold text-[10px] tracking-[1.5px] text-[#0E6B57] transform skew-x-[12deg] uppercase font-sans">
              {session?.user?.web_address || "www.commeriva.com"}
            </span>
          </div>
        </div>

      </CardContent>

      {/* <div ref={padRef} style={{ display: "none" }}>
   
        <table>
          <thead>
            <tr>
              <th>PRODUCT NAME</th>
              <th className="text-center">PRICE</th>
              <th className="text-center">QTY</th>
              <th className="text-center">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
  {invoice?.purchase_details?.map((item) => (
    <tr key={item.id}>
      <td>
        <div>
          {formatProductName(item)}

          {item?.product_item_id && (
            <span
              style={{
                marginLeft: "6px",
                fontSize: "12px",
                background: "#dbeafe",
                color: "#1d4ed8",
                padding: "2px 6px",
                borderRadius: "6px",
                fontWeight: "bold",
                border: "1px solid #93c5fd",
                display: "inline-block",
              }}
            >
              Variant{" "}
              {item?.product_items?.sku ? `(${item.product_items.sku})` : ""}
            </span>
          )}

   
          {Array.isArray(item.product_imei) &&
            item.product_imei.length > 0 && (
              <div style={{ fontSize: "11px", color: "#4b5563" }}>
                IMEI: {item.product_imei[0].imei}
              </div>
            )}

          {item?.product_item_id && (
            <div
              style={{
                fontSize: "11px",
                marginTop: "2px",
                color: "#4b5563",
              }}
            >
              Barcode: {item?.product_items?.barcode}
              {item?.product_items?.purchase_price && (
                <> · Price {item.product_items.purchase_price}</>
              )}
            </div>
          )}
        </div>
      </td>

   
      <td className="text-center">
         {parseFloat(item?.price || 0).toLocaleString("en-IN")}
      </td>

  
      <td className="text-center">{item?.qty}</td>

      <td className="text-center">
        {" "}
        {(
          parseFloat(item?.price || 0) * parseFloat(item?.qty || 1)
        ).toLocaleString("en-IN")}
      </td>
    </tr>
  ))}
</tbody>

        </table>

        <div className="bottom-row">
          <div className="terms-container">
            <div className="section-title">Terms & Condition</div>
            <ul>
              {termsData?.data?.map((terms, idx) => (
                <li key={idx}>{terms?.description}</li>
              ))}
            </ul>
          </div>

          <div className="summary-container">
            <div className="summary-row">
              <span className="summary-label">Sub-total:</span>
              <span className="summary-value"> {invoice?.sub_total?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Discount:</span>
              <span className="summary-value">
                (-)  {invoice?.discount?.toFixed(2)}
              </span>
            </div>

            

            <div className="summary-row">
              <span className="summary-label">Total Amount:</span>
              <span className="summary-value">  {(
                      (invoice?.sub_total || 0) - (invoice?.discount || 0)
                    )?.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Paid Amount:</span>
              <span className="summary-value">(-)  {parseFloat(invoice?.paid_amount || 0).toFixed(2)}</span>
            </div>

            <div className="summary-row due">
              <span className="summary-label">Due Amount:</span>
              <span className="summary-value"> {(
                      (invoice?.sub_total || 0) -
                      (invoice?.discount || 0) -
                      (invoice?.paid_amount || 0)
                    )?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div> */}

      <div ref={padRef} style={{ display: "none" }}>
        {/* Header */}
        <div className="invoice-title">PURCHASE INVOICE</div>
        <div className="invoice-header">
          <div className="header-left">
            <div className="hlabel">Vendor</div>
            <div className="value customer-name">
              {invoice?.vendor_name || "N/A"}
            </div>
            <div className="meta">
              <div>
                Contact:{" "}
                {invoice?.vendor_phone ||
                  invoice?.delivery_customer_phone ||
                  "N/A"}
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="address-block">
              <div className="hlabel">Address</div>
              <div className="value">
                {invoice?.vendor?.address ||
                  invoice?.delivery_customer_address ||
                  "N/A"}
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="barcode">
              <Barcode
                width={1}
                height={50}
                value={`${invoice?.custom_invoice_id || invoice?.invoice_id}`}
              />
              ,
            </div>

            <div className="invoice-info">
              <div>
                <strong>Date:</strong>
                {invoice?.created_at
                  ? new Date(invoice.created_at).toLocaleDateString()
                  : ""}
              </div>
            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>DESCRIPTION (CODE)</th>
              <th style={{ width: "15%" }} className="text-right">
                PRICE
              </th>
              <th style={{ width: "10%" }} className="text-center">
                QTY
              </th>
              <th style={{ width: "15%" }} className="text-right">
                TOTAL
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Product Rows */}
            {invoice?.purchase_details?.map((item) => (
              <tr key={item.id}>
                <td>{formatProductName(item)}</td>
                <td className="text-right">
                  {Number(item.price || 0).toLocaleString("en-IN")}
                </td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">
                  {(
                    Number(item.price || 0) * Number(item.qty || 1)
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}

            {/* Transaction Details row (LEFT = 2 cols only) */}
            <tr>
              <td colSpan={1} className="text-center font-semibold">
                Transaction Details
              </td>
              <td colSpan={3}></td>
            </tr>

            {/* Cash + Summary Rows */}
            <tr>
              {/* LEFT SIDE (Cash spans ONLY 2 columns) */}
              <td colSpan={1} rowSpan={5} className="align-top w-full">
                <div className="flex  justify-between gap-1">
                  {invoice?.multiple_payments?.map((payment, index) => (
                    <div
                      key={index}
                      className="flex  justify-between w-full gap-32"
                    >
                      <span className="text-left ">
                        {payment?.payment_type?.type_name}
                        {"ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ"}
                      </span>
                      <span className="text-right">
                        {formatBangladeshiAmount(payment?.payment_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </td>

              {/* RIGHT SIDE */}
              <td colSpan={2} className="text-right font-semibold">
                Sub Total
              </td>
              <td className="text-right">
                {formatBangladeshiAmount(invoice?.sub_total || 0)}
              </td>
            </tr>

            <tr>
              <td colSpan={2} className="text-right font-semibold">
                Discount
              </td>
              <td className="text-right">
                {formatBangladeshiAmount(invoice?.discount || 0)}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="text-right font-semibold">
                Total Amount
              </td>
              <td className="text-right">
                {formatBangladeshiAmount(invoice?.sub_total || 0)}
              </td>
            </tr>

            <tr>
              <td colSpan={2} className="text-right font-semibold">
                Paid Amount
              </td>
              <td className="text-right">
                {formatBangladeshiAmount(invoice?.paid_amount || 0)}
              </td>
            </tr>

            <tr>
              <td colSpan={2} className="text-right font-semibold">
                Due Amount
              </td>
              <td className="text-right">
                {formatBangladeshiAmount(
                  (invoice?.sub_total || 0) -
                  (invoice?.discount || 0) -
                  (invoice?.paid_amount || 0),
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        <div className="relative inline-block">
          <Button
            variant="outline"
            className="flex items-center bg-transparent"
            onClick={() =>
              setOpenMenu(openMenu === "download" ? null : "download")
            }
          >
            <Download className="w-4 h-4 mr-1" />
            Download PDF
          </Button>

          {openMenu === "download" && (
            <div className="absolute left-0 mt-2 bottom-10 w-40 rounded-md border bg-white shadow-lg z-50">
              <button
                onClick={() => handleDownload("design1")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 1
              </button>
              <button
                onClick={() => handleDownload("design2")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 2
              </button>
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
              <button
                onClick={() => handlePrint("design1")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 1
              </button>
              <button
                onClick={() => handlePrint("design2")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 2
              </button>
            </div>
          )}
        </div>

        {/* Pad print: middle body only */}
        <Button
          onClick={handlePadPrint}
          variant="outline"
          className="flex items-center bg-transparent"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print (Pad)
        </Button>

        <Button
          onClick={async () => {
            try {
              const { pdf } = await import("@react-pdf/renderer");
              const rawLogoUrl = invoice?.user_info?.invoice_settings?.shop_logo || null;
              const logoUrlForPdf = rawLogoUrl
                ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
                : null;

              const blob = await pdf(
                <PurchaseChallanPdf
                  invoice={invoice}
                  user={session?.user}
                  logoUrl={logoUrlForPdf}
                />,
              ).toBlob();

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
              console.error("Challan print failed:", e);
            }
          }}
          variant="outline"
          className="flex items-center bg-transparent"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print Challan
        </Button>
      </div>
    </Card>
  );
}
