"use client";
import React, { useRef, useEffect, useState } from "react";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import { Download, Printer } from "lucide-react";
import { useSession } from "next-auth/react";

const BarcodeLabel = ({ barcodeValue, name, price }) => {
  const { data: session } = useSession();
  const svgRef = useRef(null);
  const labelRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const outletName = session?.user?.outlet_name || "Outlet Name";

  useEffect(() => {
    if (svgRef.current && barcodeValue) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 50,
          displayValue: false,
          margin: 0,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [barcodeValue]);

  const handleDownload = () => {
    if (labelRef.current) {
      toPng(labelRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${name}_label.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Error generating PNG:", err);
        });
    }
  };

  const handlePrint = () => {
    if (labelRef.current) {
      const printContent = labelRef.current.innerHTML;

      const html = `
      <html>
        <head>
          <title>Print Label</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .label-container {
              width: 240px;
              min-height: 115px;
              font-family: Arial, sans-serif;
              border: 1px solid #ccc;
              padding: 8px;
              border-radius: 8px;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .barcode-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 200px;
              margin-bottom: 4px;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank", "width=800,height=600");

      if (printWindow) {
        printWindow.onload = () => {
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  return (
    <div
      className="relative flex flex-col items-start group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label Section */}
      <div
        ref={labelRef}
        className="bg-white border border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-sm w-full md:w-[240px]"
        style={{
          minHeight: "115px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Shop Name */}
        <div className="text-[11px] font-bold text-gray-800 mb-1 text-center uppercase tracking-wide">
          {outletName}
        </div>

        {/* Product Name */}
        <div className="text-sm font-semibold text-gray-900 mb-2 text-center leading-tight px-2">
          {name}
        </div>

        {/* Barcode */}
        <div
          className="flex justify-center mb-2"
          style={{
            maxWidth: "220px",
            width: "100%",
          }}
        >
          <svg ref={svgRef}></svg>
        </div>

        {/* ID & Price */}
        <div className="text-[10px] font-semibold text-gray-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <span>ID: {barcodeValue}</span>
            <span>|</span>
            <span>Price: {price} /-</span>
          </div>
        </div>
      </div>

      {/* Hover Overlay for PC */}
      <div
        className={`
          absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-lg flex flex-col justify-center items-center gap-2 
          opacity-0 pointer-events-none transition-all duration-300 ease-in-out
          group-hover:opacity-100 group-hover:pointer-events-auto
          hidden md:flex
        `}
      >
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-xs"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-xs"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>

      {/* Default Buttons for Mobile (always visible) */}
      <div className="flex justify-between gap-2 w-full mt-2 md:hidden">
        <button
          onClick={handleDownload}
          className="flex justify-center w-full items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-xs"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={handlePrint}
          className="flex justify-center w-full items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-xs"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>
    </div>
  );
};

export default BarcodeLabel;
