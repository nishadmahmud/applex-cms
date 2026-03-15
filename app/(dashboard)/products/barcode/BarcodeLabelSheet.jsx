// "use client";

// import React, { useEffect, useRef } from "react";
// import JsBarcode from "jsbarcode";
// import { useSession } from "next-auth/react";

// /**
//  * BarcodeLabelSheet — print/download-optimized label for A4 sheet layouts
//  * - Neutral white background
//  * - Balanced spacing
//  * - True-to-scale barcode alignment
//  * - Compact typography
//  */
// export default function BarcodeLabelSheet({ barcodeValue, name, price }) {
//   const svgRef = useRef(null);
//   const { data: session } = useSession();
//   const outletName = session?.user?.outlet_name || "Outlet Name";

//   useEffect(() => {
//     if (svgRef.current && barcodeValue) {
//       try {
//         JsBarcode(svgRef.current, barcodeValue, {
//           format: "CODE128",
//           lineColor: "#000000",
//           width: 1.3, // consistent width ratio for print
//           height: 36, // good optical height for label sheets
//           displayValue: false,
//           margin: 0,
//         });
//       } catch (error) {
//         console.error("Error generating barcode:", error);
//       }
//     }
//   }, [barcodeValue]);

//   return (
//     <div
//       className="barcode-label-print"
//       style={{
//         width: "175px",
//         height: "108px", // stable taller base
//         border: "1px solid #cbd5e1",
//         borderRadius: "6px",
//         backgroundColor: "#fff",
//         padding: "2px 2px",
//         boxSizing: "border-box",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         textAlign: "center",
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       {/* Outlet Name */}
//       <div
//         style={{
//           fontSize: "10px",
//           fontWeight: "700",
//           textTransform: "uppercase",
//           color: "#000",
//           marginBottom: "0.5px",
//         }}
//       >
//         {outletName}
//       </div>

//       {/* Product Name */}
//       <div
//         style={{
//           fontSize: "10px",
//           color: "#000",
//           fontWeight: "600",
//           textDecoration: "underline",
//           textUnderlineOffset: "2px",
//           lineHeight: "1.1",
//           maxWidth: "175px",
//           overflow: "hidden",
//           textOverflow: "ellipsis",
//           whiteSpace: "nowrap",
//           marginBottom: "0.5px",
//           textAlign: "center",
//         }}
//       >
//         {name}
//       </div>

//       {/* Price */}
//       <div
//         style={{
//           fontSize: "10px",
//           fontWeight: "600",
//           color: "#000",
//           marginBottom: "0.5px",
//         }}
//       >
//         TK. {price ?? 0}/-
//       </div>

//       {/* Barcode Graphic */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           width: "155px",
//           height: "50px", // increased space for cleaner look
//           marginBottom: "0.5px",
//         }}
//       >
//         <svg ref={svgRef}></svg>
//       </div>

//       {/* Barcode Numeric Value */}
//       <div
//         style={{
//           fontSize: "10px",
//           fontWeight: "600",
//           color: "#000",
//           marginTop: "0.5px",
//         }}
//       >
//         {barcodeValue}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { useSession } from "next-auth/react";

/**
 * BarcodeLabelSheet — print/download-optimized label for A4 layouts
 * Client-approved adjustments:
 *  • Physical size ≈ 1.5in × 1in (175×108 px)
 *  • White background
 *  • Font increases:
 *      - Store name: +3 sizes & bold
 *      - Product name: +2 sizes
 *      - Price: +4 sizes
 *      - Barcode number: +1 size
 *  • Reduced extra space below barcode
 */
export default function BarcodeLabelSheet({ barcodeValue, name, price }) {
  const svgRef = useRef(null);
  const { data: session } = useSession();
  const outletName = session?.user?.outlet_name || "Outlet Name";

  // === Generate barcode
  useEffect(() => {
    if (svgRef.current && barcodeValue) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: "CODE128",
          lineColor: "#000000",
          width: 1.3,
          height: 34, // slightly shorter to tighten overall label
          displayValue: false,
          margin: 0,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [barcodeValue]);

  // === Intelligent truncation for long product names
  const getDisplayedName = (fullName) => {
    if (!fullName) return "";
    const maxChars = 24; // fits nicely in 175px width
    if (fullName.length <= maxChars) return fullName;

    // Try to keep early key words
    const words = fullName.split(" ");
    let truncated = "";
    for (const word of words) {
      if ((truncated + word).length + 1 > maxChars - 1) break;
      truncated += (truncated ? " " : "") + word;
    }
    return truncated.trim() + "...";
  };

  const shortName = getDisplayedName(name);

  return (
    <div
      className="barcode-label-print"
      style={{
        width: "180px", //175px
        height: "112px", // ~1.5in × 1in at print scale //108px
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        padding: "2px 3px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* === Outlet Name — bigger & bold === */}
      <div
        style={{
          fontSize: "13px", // +3 sizes
          fontWeight: "700",
          textTransform: "uppercase",
          color: "#000",
          marginBottom: "0px",
        }}
      >
        {outletName}
      </div>

      {/* === Product Name — larger & wrapped if needed === */}
      <div
        style={{
          fontSize: "13px", // +2 sizes
          color: "#000",
          fontWeight: "700",
          // textDecoration: "underline",
          // textUnderlineOffset: "2px",
          lineHeight: "1",
          maxWidth: "175px",
          whiteSpace: "normal",
          wordBreak: "break-word",
          textAlign: "center",
          marginBottom: "0px",
        }}
      >
        {shortName}
      </div>

      {/* === Price — biggest text === */}
      <div
        style={{
          fontSize: "20px", // 🔹 Much bigger for emphasis
          fontWeight: "900", // 🔹 Strong bold
          color: "#000",
          marginBottom: "0px",
        }}
      >
        TK. {price ?? 0}/-
      </div>

      {/* === Barcode Graphic === */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "155px",
          height: "42px", // tightened (was 50 px)
          marginBottom: "0px", // reduced bottom gap under barcode
        }}
      >
        <svg ref={svgRef}></svg>
      </div>

      {/* === Barcode Numeric Value — slightly bigger === */}
      <div
        style={{
          fontSize: "11px", // +1 size
          fontWeight: "600",
          color: "#000",
          marginTop: "-2px", // removed top space to close red‑box gap
          marginBottom: "1px",
        }}
      >
        {barcodeValue}
      </div>
    </div>
  );
}
