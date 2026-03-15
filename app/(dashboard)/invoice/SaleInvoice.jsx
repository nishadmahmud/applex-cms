/* eslint-disable react/prop-types */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import SalesPadContainer from "./SalesPadContainer";
import SaleInvoicePdf1 from "./SaleInvoicePdf1";
import SaleInvoicePdf2 from "./SaleInvoicePdf2";
import SaleInvoicePdf3 from "./SaleInvoicePdf3";
import SaleInvoicePdf4 from "./SaleInvoicePdf4";
// import { useReactToPrint } from "react-to-print"; // Unused
// import SalePadPrint from "./components/SalePadPrint"; // Unused
import SaleInvoicePdf3mm from "./SaleInvoicePdf3mm";
import SaleInvoicePdf2mm from "./SaleInvoicePdf2mm";
import HtmlInvoiceCustom from "./HtmlInvoiceCustom";
import SaleInvoicePadPdf from "./SaleInvoicePadPdf";

export default function SaleInvoice({
  invoice,
  targetRef,
  session,
  barcodeRef,
  barcodeId,
}) {
  // Generate barcode
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

  // ✅ NEW: Listen for Enter key to print 2mm design
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handlePrint("design2mm");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [invoice]); // Re-run if invoice data changes to ensure handlePrint has latest context

  const formatProductName = (item) => {
    let name = item?.product_info?.name || "Unnamed Product";

    // 🟩 If have_product_variant true and a product_variant object exists
    if (
      item?.product_info?.have_product_variant ||
      item?.have_product_variant ||
      item?.product_variant
    ) {
      const variant = item.product_variant;
      if (variant?.name) {
        // append variant name — e.g. "New T shirt in the market (Small)"
        name += ` - ${variant.name}`;
      }

      const childVariant = item?.child_product_variant;
      if (childVariant?.name) {
        name += ` - ${childVariant.name}`;
      }
      // optional extras
      const extra = [];
      // if (variant?.sku) extra.push(`SKU: ${variant.sku}`);
      // if (variant?.barcode) extra.push(`Barcode: ${variant.barcode}`);
      if (extra.length > 0) {
        name += ` (${extra.join(" | ")})`;
      }
    }

    // existing IMEI / color / storage details
    const imeis = item?.product_imei;
    if (Array.isArray(imeis) && imeis.length > 0) {
      const first = imeis[0];
      const parts = [];
      if (first.color) parts.push(`Color: ${first.color}`);
      if (first.storage) parts.push(`Storage: ${first.storage}`);
      if (first.region) parts.push(`Region: ${first.region}`);
      if (parts.length > 0) name += ` (${parts.join(" | ")})`;
    }

    // ✅ NEW: Append Default Warranty (Moved to end)
    const defWarranties = invoice?.data?.defaultwarranties;
    if (Array.isArray(defWarranties)) {
      // Find warranty for this product
      const wItem = defWarranties.find((w) => w.product_id === item.product_id);
      if (wItem?.warranty?.name) {
        name += ` (${wItem.warranty.name})`;
      }
    }

    return name;
  };

  const { data: termsData } = useGetTermsConditionsQuery();

  const userSettings = session?.user?.invoice_settings || {};
  const userInfo = invoice?.data?.user_info;
  const settingsFromInvoice = userInfo?.invoice_settings || {};
  const firstCode = userSettings.first_code || settingsFromInvoice.first_code;
  const secondCode =
    userSettings.second_code || settingsFromInvoice.second_code;

  // 🏪 Store-specific flag — Dizmo (id 265 / 353 or name match)
  const isDizmo =
    session?.user?.id === 265 ||
    session?.user?.id === 353 ||
    session?.user?.outlet_name?.toLowerCase()?.includes("dizmo") ||
    userInfo?.id === 265 ||
    userInfo?.id === 353 ||
    userInfo?.outlet_name?.toLowerCase()?.includes("dizmo");
  const qrCanvasRef = useRef(null);

  const subTotal = Number(invoice?.data?.sub_total || 0);
  const discount = Number(invoice?.data?.discount || 0);
  const vat = Number(invoice?.data?.vat || 0);
  const deliveryFee = Number(invoice?.data?.delivery_fee || 0);
  const paid = Number(invoice?.data?.paid_amount || 0);
  const exchangeImeis = invoice?.data?.exchange_imeis || [];
  const salesDetails = invoice?.data?.sales_details || [];

  // 🧮 SUM exchanged IMEI purchase prices
  const exchangeTotal = exchangeImeis.reduce(
    (sum, item) => sum + Number(item?.purchase_price || 0),
    0,
  );

  // Subtotal with deduction of exchange value
  const adjustedSubTotal = subTotal - exchangeTotal;
  const total = adjustedSubTotal - discount + vat + deliveryFee;
  // const due = total - paid;
  // --------------------------------------
  // ✅ Final due / change logic
  // --------------------------------------
  const rawChange = invoice?.data?.cash_change;
  const hasChange =
    rawChange !== null &&
    rawChange !== undefined &&
    rawChange !== "" &&
    Number(rawChange) > 0;

  const changeAmount = hasChange ? Number(rawChange) : 0;

  // If customer overpaid → due = 0, else normal formula
  const due = hasChange ? 0 : Math.max(total - paid, 0);

  // ---------- PAD-STYLE CALCULATIONS (to match SaleInvoicePadPdf) ----------
  const calculatedTotal = salesDetails.reduce(
    (sum, item) =>
      sum +
      Number(item?.price || 0) * Number(item?.qty || 0),
    0,
  );

  const padFinalTotal =
    calculatedTotal - exchangeTotal - discount + vat + deliveryFee;

  const padEffectivePaid =
    changeAmount > 0 ? padFinalTotal : paid;

  const padEffectiveDue =
    changeAmount > 0 ? 0 : Math.max(padFinalTotal - padEffectivePaid, 0);

  // Amount in words helper (same logic as pad PDF)
  const numberToWords = (num) => {
    if (!num) return "";
    const a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";

    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`) + "Crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`) + "Lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`) + "Thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`) + "Hundred "
        : "";
    str +=
      n[5] != 0
        ? (str !== "" ? "and " : "") +
        (a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`)
        : "";

    return str.trim().toUpperCase();
  };

  const amountInWords =
    padFinalTotal > 0
      ? `${numberToWords(Math.round(padFinalTotal))} TAKA ONLY`
      : "";

  const [qrImage, setQrImage] = useState(null);
  const [barcodeImage] = useState(null);
  const [openMenu, setOpenMenu] = React.useState(null);
  // "download" | "print" | null

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

  // ✅ replaces current buildPdfBlob
  const buildPdfBlob = async (design) => {
    // dynamic import fixes “Cannot read properties of null (reading 'write')”
    const { pdf } = await import("@react-pdf/renderer");

    const rawLogoUrl =
      invoice?.data?.user_info?.invoice_settings?.shop_logo || null;

    const logoUrlForPdf = rawLogoUrl
      ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
      : null;

    const invoiceViewUrl =
      `https://pos.outletexpense.com/invoice-view/${invoice?.data?.custom_invoice_id || invoice?.data?.invoice_id || ""}`.trim() ||
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
      design === "design1"
        ? SaleInvoicePdf1
        : design === "design2"
          ? SaleInvoicePdf2 // Print 2 keeps its own header/footer
          : design === "design3"
            ? SaleInvoicePdf3
            : design === "design4"
              ? SaleInvoicePdf4
              : design === "design3mm"
                ? SaleInvoicePdf3mm
                : design === "design2mm"
                  ? SaleInvoicePdf2mm
                  : SaleInvoicePadPdf; // explicit pad style (design === "pad")

    return await pdf(
      <PdfComponent
        orderId={barcodeId}
        qrDataUrl={qrDataUrl}
        invoice={invoice}
        session={session}
        qrImage={qrImage}
        barcodeImage={barcodeDataUrl}
        logoUrl={logoUrlForPdf}
        termsData={termsData?.data}
        userSettings={userSettings}
        calculations={{
          subTotal,
          discount,
          vat,
          deliveryFee,
          total,
          paid,
          totalDue: due,
          changeAmount,
          exchangeTotal,
          adjustedSubTotal,
        }}
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

      // Create invisible iframe
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
          // Optional: Cleanup iframe after printing (or let it stay until refresh)
          // removing immediately might stop print in some browsers
        }, 500);
      };
    } catch (e) {
      console.error("Print failed", e);
    } finally {
      setOpenMenu(null);
    }
  };

  // NEW: HTML print for the custom design (Option A)
  const handlePrintCustomHtml = () => {
    const container = document.getElementById("custom-html-invoice");
    if (!container) return;

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) {
      alert("Popup blocked. Please allow popups to print.");
      return;
    }

    // copy all current stylesheet links so Tailwind/styles apply
    const cssHrefs = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    )
      .map((l) => l.href)
      .filter(Boolean);

    const linkTags =
      cssHrefs.length > 0
        ? cssHrefs
          .map((href) => `<link rel="stylesheet" href="${href}" />`)
          .join("\n")
        : `<link rel="stylesheet" href="/styles/globals.css" />`; // fallback if needed

    printWin.document.open();
    printWin.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          ${linkTags}
          <style>
            @page { size: A4; margin: 2mm;  }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${container.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.onafterprint = function () { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // -------- PAD PRINT (no header/footer, condition fixed bottom) --------
  return (
    <Card className="py-10 bg-blue-50 border-0 shadow-none">
      {/* ================= MAIN INVOICE (for screen/PDF) ================= */}
      <CardContent
        ref={targetRef}
        className="max-w-[794px] min-h-[1123px] pb-10 mx-auto font-sans text-sm bg-white px-0 relative"
      >
        {/* ---- HEADER (Angled Design like Print 2) ---- */}
        <div className="relative w-full min-h-[120px] mb-6 overflow-hidden py-4">
          {/* Base Background (Green/Dark) */}
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
                    "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
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
                {/* Phone */}
                <span className="font-bold">
                  {(() => {
                    // Try session user settings first, then invoice data
                    const s = session?.user?.invoice_settings;
                    const i = invoice?.data?.user_info?.invoice_settings;
                    const u = session?.user || invoice?.data?.user_info;

                    // Combine primary & additional mobile
                    const mobiles = [
                      s?.mobile_number || i?.mobile_number,
                      s?.additional_mobile_number || i?.additional_mobile_number
                    ].filter(Boolean);

                    if (mobiles.length > 0) return mobiles.join(" / ");

                    // Fallback to old phone field
                    return u?.phone || "N/A";
                  })()}
                </span>
                <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" className="w-3 h-3" alt="phone" />
              </p>
              <p className="text-sm text-gray-800 mb-1 flex items-center justify-end gap-2">
                {/* Email */}
                <span>{userSettings.email || settingsFromInvoice.email}</span>
                <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" className="w-3 h-3" alt="email" />
              </p>
              <p className="text-sm text-gray-800 flex items-center justify-end gap-2 max-w-[250px]">
                {/* Address */}
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

        {/* CUSTOMER INFO ROW */}
        <div className="px-8 mb-6">
          <h2 className="text-center font-bold text-xl mb-4 border-y border-gray-300 py-2">SALES INVOICE</h2>
          <div className="flex justify-between text-sm">
            {/* Left: Customer */}
            <div className="w-[40%]">
              <h3 className="font-bold text-gray-600 mb-1">Customer</h3>
              <p className="font-bold text-base">{invoice?.data?.customer_name || "Walk-in"}</p>
              <p>Contact: {invoice?.data?.customer_phone || "N/A"}</p>
            </div>

            {/* Middle: Address */}
            <div className="w-[25%]">
              <h3 className="font-bold text-gray-600 mb-1">Address</h3>
              <p>{invoice?.data?.customer_address || "N/A"}</p>
            </div>

            {/* Right: Invoice Info */}
            <div className="w-[35%] text-right flex flex-col items-end">
              {/* QR/Barcode Area */}
              <div className="mb-2 flex flex-col items-end">
                {barcodeRef && (
                  // JsBarcode draws directly into this SVG element
                  <svg
                    ref={barcodeRef}
                    className="w-40 h-10"
                  />
                )}
                {invoice?.data?.invoice_id && (
                  <span className="mt-1 text-xs font-semibold tracking-wide">
                    {invoice.data.invoice_id}
                  </span>
                )}
              </div>
              <p className="mb-1">{invoice?.data?.custom_invoice_id}</p>
              {/* Parcel ID */}
              {invoice?.data?.stead_fast_courier?.consignment_id && (
                <p className="text-sm">
                  <span className="font-bold">Parcel ID: </span>
                  {invoice.data.stead_fast_courier.consignment_id}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Date: {invoice?.data?.created_at ? new Date(invoice.data.created_at).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* PAD-STYLE BODY (screen) - matches pad PDF layout */}
        <div className="mb-8 px-7">
          <Table className="border border-gray-400 border-collapse w-full text-[13px]">
            <TableHeader>
              <TableRow
                className="p-0 border-b border-gray-400 bg-gray-100"
              >
                <TableHead className="w-[5%] text-center border-r border-gray-400 font-bold h-auto py-0.5">
                  N°
                </TableHead>
                <TableHead className="w-[45%] border-r border-gray-400 font-bold h-auto py-0.5">
                  DESCRIPTION(CODE)
                </TableHead>
                <TableHead className="w-[15%] text-right border-r border-gray-400 font-bold h-auto py-0.5">
                  PRICE
                </TableHead>
                <TableHead className="w-[10%] text-center border-r border-gray-400 font-bold h-auto py-0.5">
                  QTY
                </TableHead>
                <TableHead className="w-[10%] text-center border-r border-gray-400 font-bold h-auto py-0.5">
                  DIS
                </TableHead>
                <TableHead className="w-[15%] text-right font-bold h-auto py-0.5">
                  TOTAL
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {salesDetails.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-b border-gray-200 align-top"
                >
                  <TableCell className="text-center border-r border-gray-200 py-0.5">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5">
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
                  </TableCell>
                  <TableCell className="text-right border-r border-gray-200 py-0.5">
                    {Number(item.price || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200 py-0.5">
                    {item.qty} Pcs
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200 py-0.5">
                    -
                  </TableCell>
                  <TableCell className="text-right font-semibold py-0.5">
                    {(Number(item.price || 0) * Number(item.qty || 0)).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Exchange rows */}
              {exchangeImeis.map((ex) => (
                <TableRow
                  key={`exchange-${ex.id}`}
                  className="border-b border-gray-200 bg-red-50 align-top"
                >
                  <TableCell className="text-center border-r border-gray-200 text-red-700 font-semibold py-0.5">
                    Ex
                  </TableCell>
                  <TableCell className="border-r border-gray-200 py-0.5">
                    <div className="font-semibold text-red-700">
                      {ex.product_name}
                    </div>
                    <div className="text-[11px] text-red-600 mt-0.5 italic">
                      IMEI: {ex.imei} (Exchange)
                    </div>
                  </TableCell>
                  <TableCell className="text-right border-r border-gray-200 text-red-700 font-semibold py-0.5">
                    {Number(ex.purchase_price || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200 text-red-700 font-semibold py-0.5">
                    1 Pcs
                  </TableCell>
                  <TableCell className="text-center border-r border-gray-200 text-red-700 font-semibold py-0.5">
                    -
                  </TableCell>
                  <TableCell className="text-right text-red-700 font-semibold py-0.5">
                    (-)
                    {Number(ex.purchase_price || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* BOTTOM SECTION (screen) – pad-style Transaction + Totals + Terms */}
        <div className="px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="border border-gray-300 bg-gray-50">
              <div className="text-center font-semibold text-[13px] border-b border-gray-300 py-1">
                TRANSACTION DETAILS
              </div>
              <div className="p-3 space-y-2">
                {invoice?.data?.multiple_payment?.length > 0 ? (
                  invoice.data.multiple_payment.map((pay, i) => (
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
                    <span>{invoice?.data?.pay_mode || "Cash"}</span>
                    <span className="font-semibold">
                      {padEffectivePaid.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border border-gray-300">
              {vat > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">VAT</span>
                  <span>
                    {vat.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">Delivery</span>
                  <span>
                    {deliveryFee.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                  <span className="font-semibold text-gray-700">Discount</span>
                  <span>
                    (-)
                    {discount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 bg-gray-100">
                <span className="font-semibold text-[13px] uppercase">
                  Gross Total
                </span>
                <span className="font-bold text-[14px]">
                  {padFinalTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 text-[13px]">
                <span className="font-semibold text-gray-700">
                  Paid Amount
                </span>
                <span className="font-semibold">
                  {padEffectivePaid.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-1 text-[13px] bg-gray-50">
                <span className="font-semibold">Outstanding</span>
                <span
                  className={`font-semibold ${padEffectiveDue > 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                >
                  {padEffectiveDue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* AMOUNT IN WORDS (UI) – should appear above Terms & Conditions */}
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
                {termsData?.data?.map((terms, idx) => (
                  <li key={idx}>• {terms?.description}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* HIDDEN: Custom HTML invoice (Option A) */}
          <div id="custom-html-invoice" className="hidden">
            <HtmlInvoiceCustom
              invoice={invoice?.data || {}}
              invoiceSetting={session?.user?.invoice_settings || {}}
              invoiceImeis={invoice?.data?.invoice_imeis || []}
              inputs={termsData?.data || []}
              formattedDateTime={
                invoice?.data?.created_at
                  ? new Date(invoice.data.created_at).toLocaleString()
                  : ""
              }
              totalPricePrintCustomize={subTotal}
              totalItemsPrintCustomize={0}
              totalPrice={subTotal}
              totalQty={0}
              BASE_URL={
                typeof window !== "undefined" ? window.location.origin : ""
              }
              exChangeImeis={invoice?.data?.exchange_imeis || []}
            />
          </div>
        </div>

        {/* FOOTER (screen only) - Exact PDF2 Replica */}
        <div className="mt-10 w-full h-[45px] overflow-hidden">
          {/* Green Bar (Bottom 22px) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[22px] z-0"
            style={{ backgroundColor: secondCode || "#1e293b" }}
          />

          {/* Orange Angled Band (Bottom 14px, inset 40px, Skewed) */}
          <div
            className="absolute bottom-[14px] left-[40px] right-[40px] h-[18px] transform -skew-x-[12deg] z-10 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: firstCode || "#a9d0b8" }}
          >
            <span className="font-bold text-[10px] tracking-[1.5px] text-[#0E6B57] transform skew-x-[12deg] uppercase font-sans">
              {session?.user?.web_address || "www.Applex.com"}
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
                Design 1
              </button>
              <button
                onClick={() => handleDownload("design2")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Design 2
              </button>
              <button
                onClick={() => handleDownload("design3")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Design 3
              </button>
              <button
                onClick={() => handleDownload("design4")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Design 4
              </button>
              <button
                onClick={() => handleDownload("design3mm")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Design 3 (3 mm)
              </button>
              <button
                onClick={() => handleDownload("design2mm")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Design 2 (2 mm)
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
              <button
                onClick={() => handlePrint("design3")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 3
              </button>
              <button
                onClick={() => handlePrint("design4")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print 4
              </button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center bg-transparent"
                onClick={() => handlePrint("design3mm")}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print (3 mm)
              </Button>
              <button
                onClick={() => handlePrint("design2mm")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print (2 mm)
              </button>
              <button
                onClick={() => handlePrintCustomHtml()}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                Print Custom
              </button>
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
    </Card >
  );
}
