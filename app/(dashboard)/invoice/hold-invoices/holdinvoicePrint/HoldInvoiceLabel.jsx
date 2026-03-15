"use client";
import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function HoldInvoiceLabel({ invoice, session }) {
  const barcodeRef = useRef(null);
  const parcelId =
    invoice?.steadfast_courier?.consignment_id ||
    invoice?.pathao_consignment_id ||
    "N/A";

  useEffect(() => {
    if (barcodeRef.current && parcelId && parcelId !== "N/A") {
      try {
        JsBarcode(barcodeRef.current, parcelId, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 2,
        });
      } catch (err) {
        console.warn("Barcode error:", err);
      }
    }
  }, [parcelId]);

  const formatDT = (t) => {
    const d = new Date(t);
    return {
      date: d.toLocaleDateString("en-GB"),
      time: d.toLocaleTimeString("en-US", { hour12: true }),
    };
  };

  const dt = formatDT(invoice.created_at);
  const shop = session?.user?.invoice_settings;
  const logo =
    shop.shop_logo ||
    shop.profile_pic ||
    invoice?.user_info?.profile_pic ||
    "/placeholder-shop.png";
  console.log(logo);

  return (
    <div
      style={{
        border: "1px solid #999",
        borderRadius: "6px",
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Arial, sans-serif",
        width: "100%",
        height: "8.7cm",
        boxSizing: "border-box",
      }}
    >
      {/* row 1 */}
      <div style={{ alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={logo}
            alt="logo"
            width="42"
            height="42"
            style={{ objectFit: "contain" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div style={{ fontSize: "16px" }}>
            <div style={{ fontWeight: "bold" }}>
              Shipped From: {shop.shop_name || "Shop Name"}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "15px", marginTop: "6px" }} className="">
          <div>
            {" "}
            <b>Contact:</b> {shop.mobile_number || "N/A"}
          </div>
          <div>
            <b>Email:</b> {shop.email || "N/A"}
          </div>
          <div>
            <b>Address:</b> {shop.shop_address || "N/A"}
          </div>
        </div>
      </div>

      {/* row 2 */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "15px",
          paddingTop: "6px",
          borderTop: "1px solid #ccc",
          alignItems: "center",
        }}
      >
        <div>
          <b>Name:</b> {invoice.delivery_customer_name}
        </div>
        <div>
          <b>Phone:</b> {invoice.delivery_customer_phone}
        </div>
        <div>
          <b>Address:</b> {invoice.delivery_customer_address}
        </div>
      </div>

      {/* row 3 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "15px",
          borderTop: "1px solid #ccc",
          paddingTop: "6px",
        }}
      >
        <div style={{ width: "60%" }}>
          <div>
            <b>Invoice:</b> {invoice.invoice_id}
          </div>
          <div>
            <b>Product:</b>{" "}
            {invoice.sales_details
              ?.map((x) => {
                const name = x?.product_info?.name || "";
                const variant = x?.product_variant?.name;
                const qty = x?.qty || 0;
                return variant
                  ? `${name} (${variant}) x${qty}`
                  : `${name} x ${qty}`;
              })
              ?.join(", ")}
          </div>
          <div>
            <b>Collectable Amount:</b> BDT{" "}
            {Number(invoice.sub_total + invoice.delivery_fee).toFixed(2)}
          </div>
        </div>

        <div
          style={{
            width: "40%",
            textAlign: "center",
          }}
        >
          <svg ref={barcodeRef}></svg>
          <div style={{ fontWeight: "bold" }}>{parcelId}</div>
          <div>
            {dt.date} {dt.time}
          </div>
        </div>
      </div>
    </div>
  );
}
