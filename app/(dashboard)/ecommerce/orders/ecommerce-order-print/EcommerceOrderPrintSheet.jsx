"use client";
import React, { forwardRef } from "react";
import EcommerceOrderLabel from "./EcommerceOrderLabel";

const EcommerceOrderPrintSheet = forwardRef(({ orders, session }, ref) => (
  <div ref={ref} style={{ background: "#fff" }}>
    {Array.from({ length: Math.ceil(orders.length / 3) }).map(
      (_, pageIndex) => {
        const pageOrders = orders.slice(pageIndex * 3, pageIndex * 3 + 3);
        return (
          <div className="print-page" key={pageIndex}>
            {pageOrders.map((order) => (
              <EcommerceOrderLabel
                key={order.id}
                order={order}
                session={session}
              />
            ))}
          </div>
        );
      },
    )}
  </div>
));

export default EcommerceOrderPrintSheet;
