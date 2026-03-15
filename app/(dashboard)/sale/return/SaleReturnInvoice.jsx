/* eslint-disable react/prop-types */
"use client";

import React, { useRef, useEffect, useState } from "react";
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
import SaleReturnInvoicePdf1 from "./SaleReturnInvoicePdf1";
import SaleReturnInvoicePdf2 from "./SalesReturnInvoicePdf2";
import SaleReturnPadPrint from "../../invoice/components/SaleReturnPadPrint";
import SalesReturnPadContainer from "../../invoice/SalesReturnPadContainer";
import { useReactToPrint } from "react-to-print";

export default function SaleReturnInvoice({
  saleReturn,  
  session,
  barcodeId,
}) {
  const targetRef = useRef(null);
  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const [qrImage, setQrImage] = useState(null);
  const [barcodeImage] = useState(null);
  const { data: termsData } = useGetTermsConditionsQuery();
  const terms = termsData?.data || [];
   const [openMenu, setOpenMenu] = React.useState(null); 

console.log(saleReturn);
  // Generate barcode
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

  // QR image for PDF
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

  // ---------- PDF helpers ----------
const buildPdfBlob = async (design) => {
  const rawLogoUrl =
    saleReturn?.user_info?.invoice_settings?.shop_logo || null;

  const logoUrlForPdf = rawLogoUrl
    ? `/api/logo-proxy?url=${encodeURIComponent(rawLogoUrl)}`
    : null;

  const invoiceViewUrl =
    `https://pos.outletexpense.com/invoice-view/${saleReturn?.return_id || ""}`.trim() ||
    "https://pos.outletexpense.com";
  const qrDataUrl = await QRCode.toDataURL(invoiceViewUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 120,
  });

  const PdfComponent =
    design === "design1" ? SaleReturnInvoicePdf1 : SaleReturnInvoicePdf2;

  return await pdf(
    <PdfComponent
    orderId={barcodeId}
      qrDataUrl={qrDataUrl}
      invoice={saleReturn}
      session={session}
      qrImage={qrImage}
      barcodeImage={barcodeImage}
      termsData={terms}
      logoUrl={logoUrlForPdf}
    />
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

    // Open a blank window
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow popups for this site to print.");
      return;
    }

    // Write a basic HTML shell with an iframe
    win.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
        </head>
        <body style="margin:0">
          <iframe
            id="pdfFrame"
            src="${url}"
            style="border:0; width:100%; height:100vh;"
          ></iframe>
        </body>
      </html>
    `);

    win.document.close();

    // Wait for iframe load, then print
    const iframe = win.document.getElementById("pdfFrame");
    iframe.onload = () => {
      // Small timeout helps some browsers render fully
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    };

    setOpenMenu(null);
  } catch (err) {
    console.error("Print error:", err);
    alert("Failed to generate/print PDF. Please try again.");
  }
};


  // ---------- Pad print ----------
  const padRef = useRef();

  const handleSalePrintPad = useReactToPrint({
  contentRef: padRef,
  documentTitle: "Sales Return Invoice",
});
  if (!saleReturn) return null;

  return (
    <Card className="py-10 bg-blue-50 border-0 shadow-none">
      <CardContent
        ref={targetRef}
        className="max-w-[794px] h-[1123px] pb-0 mx-auto font-sans text-sm bg-white px-0 relative"
      >
        {/* Hidden QR canvas */}
        <div style={{ position: "absolute", top: -9999, left: -9999 }}>
          <QRCodeCanvas
            ref={qrCanvasRef}
            value={session?.user?.invoice_settings?.qr_value || " "}
            size={120}
          />
        </div>

        {/* HEADER (you can change labels to "Sale Return" etc.) */}
        <div
          className={`pad-hide w-full flex items-center justify-between pt-8 pb-2 mb-4 px-10 rounded-b-[4rem] ${
            session.user.invoice_settings.first_code ? "" : "bg-gray-300"
          }`}
          style={{
            backgroundColor:
              session.user.invoice_settings.first_code || undefined,
          }}
        >
          {/* LEFT: Customer / Party Info */}
          <div className="flex flex-col flex-1">
            <Image
              src={
                session?.user?.invoice_settings?.shop_logo ||
                session?.user?.profile_pic
              }
              width={90}
              height={90}
              alt={session?.user?.invoice_settings?.shop_name}
              className="object-contain"
            />

            <div className="my-4 text-left space-y-1">
              <h3 className="text-base font-bold">Customer Details:</h3>

              <p className="text-sm">
                <span className="font-bold">Name: </span>
                { saleReturn?.customers != null ? saleReturn?.customers.name : saleReturn?.sales.customer_name || "-"}
              </p>

              <p className="text-sm">
                <span className="font-bold">Address: </span>
                {saleReturn?.customers?.address || "-"}
              </p>

              <p className="text-sm">
                <span className="font-bold">Number: </span>
                {saleReturn?.customers != null ? saleReturn?.customers.mobile_number : "-"}
              </p>

              <p className="text-sm mt-1">
                <span className="font-bold">Return ID: </span> {barcodeId || "-"}
              </p>

              <p className="text-sm">
                <span className="font-bold">Payment: </span>
                {saleReturn?.pay_mode || "-"}
              </p>
            </div>
          </div>

          {/* CENTER: QR & Barcode */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-[120px] h-[120px] mb-4">
              <QRCodeCanvas
                width={120}
                height={120}
                value={
                  session?.user?.invoice_settings?.qr_value ||
                  "https://onelink.to/gadstyleapp"
                }
              />
            </div>

            <p className="text-[10px] font-bold">{saleReturn?.return_id}</p>
          </div>

          {/* RIGHT: Shop Details */}
          <div className="flex flex-col flex-1 text-right leading-5">
            <p className="text-lg font-bold">
              {session?.user?.invoice_settings?.shop_name}
            </p>

            <p className="text-sm">
              {session?.user?.invoice_settings?.shop_address}
            </p>

            <p className="text-sm">
              <span className="font-bold">BIN No:</span>{" "}
              {session?.user?.invoice_settings?.bin || "-"}
            </p>

            <p className="text-sm">
              Return Date:{" "}
              {saleReturn?.created_at
                ? new Date(saleReturn.created_at).toLocaleDateString()
                : "-"}
            </p>

            <p className="text-sm">
              <span className="font-bold">Payment:</span>{" "}
              {saleReturn?.pay_mode || "-"}
            </p>

            <p className="text-sm">
              <span className="font-bold">Sales Person:</span>{" "}
              {session?.user?.name || "-"}
            </p>
          </div>
        </div>

        {/* BODY: table (use saleReturn.return_details or whatever your API returns) */}
        <div className="mb-8 px-5">
          <Table className="border border-gray-400">
            <TableHeader>
              <TableRow
                className={`p-0 ${
                  session.user.invoice_settings.first_code ? "" : "bg-slate-800"
                } pad-hide`}
                style={{
                  backgroundColor:
                    session.user.invoice_settings.second_code || undefined,
                }}
              >
                <TableHead className="px-4 font-bold text-white border-r border-gray-400">
                  PRODUCT NAME
                </TableHead>
                <TableHead className="text-center px-4 font-bold text-white border-r border-gray-400">
                  PRICE
                </TableHead>
                <TableHead className="text-center px-4 font-bold text-white border-r border-gray-400">
                  QTY
                </TableHead>
                <TableHead className="text-center px-4 font-bold text-white">
                  SUBTOTAL
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {saleReturn?.sales_details?.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-gray-400 rounded-md hover:bg-transparent"
                >
                  <TableCell className="py-2 px-4 border-r border-gray-400 font-medium">
                    <div className="line-clamp-2 pb-1 whitespace-normal break-words">
                      {formatProductName(item)}
                      {item?.product_item_id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-[2px] rounded-md font-bold border border-blue-300">
                          Variant&nbsp;
                          {item?.product_items?.sku
                            ? `(${item.product_items.sku})`
                            : ""}
                        </span>
                      )}
                    </div>
                    {item?.product_imei?.imei ? (
  <div className="text-[11px] text-gray-600">
    IMEI: {item.product_imei.imei}
  </div>
): ''}

                    {item?.product_item_id && (
                      <div className="text-[11px] mt-0.5 text-gray-600">
                        Barcode: {item?.product_items?.barcode}
                        {item?.product_items?.purchase_price && (
                          <>
                            {" "}
                            · Price ৳
                            {item?.product_items.purchase_price}
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-nowrap py-2 px-4 border-r border-gray-400 font-medium">
                    ৳ {parseFloat(item?.return_unit_price || 0)?.toLocaleString("en-IN")}
                    {item?.discount > 0 ? (<>
                    <span className="text-red-500"> -({item?.discount})</span>
                    </>):''}
                  </TableCell>
                  <TableCell className="text-center py-2 px-4 border-r border-gray-400 font-medium">
                    {item?.return_qty}
                  </TableCell>
                  <TableCell className="text-center py-2 px-4 font-medium">
                    ৳{" "}
                    {item.return_amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* TERMS + SUMMARY */}
        <div className="flex gap-5 items-start px-10 justify-between">
          <div className="flex items-start gap-2">
            <div>
              <h3 className="text-base mb-2 font-bold">Terms & Condition</h3>
              {terms.map((t, idx) => (
                <div key={idx}>
                  <ul>
                    <li className="text-gray-700 text-start">
                      • {t?.description}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Card className="w-1/2 border-0 shadow-none">
            <CardContent className="p-0">
              <div className="space-y-2 text-sm">
               
              
                <div className="flex justify-between items-center font-bold text-base">
                  <p className="font-bold text-sm">Total Amount:</p>
                  <p>
                    ৳{" "}
                    {(
                      (saleReturn?.return_amount || 0) -
                      (saleReturn?.discount || 0)
                    )?.toFixed(2)}
                  </p>
                </div>
              
              
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 w-full pad-hide">
          <div>
            <h6 className="text-gray-700 font-bold text-xs max-w-2xl mx-auto text-center mb-3">
              {session?.user.invoice_settings.purchase_condition}
            </h6>
          </div>

          <div
            className={`w-full mt-3 text-white text-sm py-3 px-10 flex items-center justify-between font-medium ${
              session.user.invoice_settings.first_code ? "" : "bg-slate-800"
            }`}
            style={{
              backgroundColor:
                session.user.invoice_settings.second_code || undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="opacity-90">Hotline:</span>
              <span>{session?.user?.phone}</span>
            </div>

            <div className="text-center leading-tight">
              <div>{session?.user.web_address}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="opacity-90">E-Mail:</span>
              <span>{session?.user.invoice_settings.email}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hidden pad content for print */}
      <SaleReturnPadPrint
        ref={padRef}
        footerText={session?.user?.invoice_settings?.sale_condition || ""}
      >
      <SalesReturnPadContainer
        invoice={saleReturn}
        formatProductName={formatProductName}
        return_amount={saleReturn?.pay_mode}
        termsData={termsData}
      ></SalesReturnPadContainer>
     
      </SaleReturnPadPrint>

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
           onClick={() =>
             setOpenMenu(openMenu === "print" ? null : "print")
           }
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

        <Button
         onClick={() => handleSalePrintPad()}
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