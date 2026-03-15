"use client";
import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

const BarCodeLable = ({ barcodeValue }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && barcodeValue) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: "CODE128",
          lineColor: "#00000",
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

  return (
    <div
      className="flex justify-center items-center p-2"
      style={{ width: "240px", minHeight: "80px" }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarCodeLable;
