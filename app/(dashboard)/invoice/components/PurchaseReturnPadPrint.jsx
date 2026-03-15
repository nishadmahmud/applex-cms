/* eslint-disable react/prop-types */
import React, { forwardRef } from "react";
import { salePadPrintStyles } from "./printStyles";

const PurchaseReturnPadPrint = forwardRef(({ children, footerText }, ref) => {
  return (
    <div ref={ref} className="print-only-root">
      {/* PRINT STYLES */}
      <style>
        {salePadPrintStyles}

        {`
          /* Hide on screen */
          .print-only-root {
            display: none;
          }

          /* Show only when printing */
          @media print {
            .print-only-root {
              display: block;
            }

            /* Hide everything else */
            body * {
              visibility: hidden;
            }

            .print-only-root,
            .print-only-root * {
              visibility: visible;
            }

            .print-only-root {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      <div className="page">
        <div className="content">{children}</div>
        <div className="footer-fixed">{footerText}</div>
      </div>
    </div>
  );
});

PurchaseReturnPadPrint.displayName = "PurchaseReturnPadPrint";
export default PurchaseReturnPadPrint;
