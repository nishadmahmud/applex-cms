"use client";
import React, { forwardRef } from "react";
import HoldInvoiceLabel from "./HoldInvoiceLabel";

const HoldInvoicePrintSheet = forwardRef(({ invoices, session }, ref) => (
  <div ref={ref} style={{ background: "#fff" }}>
    {Array.from({ length: Math.ceil(invoices.length / 3) }).map(
      (_, pageIndex) => {
        const pageInvoices = invoices.slice(pageIndex * 3, pageIndex * 3 + 3);

        return (
          <div className="print-page" key={pageIndex}>
            {pageInvoices.map((inv) => (
              <HoldInvoiceLabel
                key={inv.id}
                invoice={inv}
                session={session}
              />
            ))}
          </div>
        );
      },
    )}
  </div>
));

export default HoldInvoicePrintSheet;