"use client";
import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function EcommerceOrderLabel({ order, session }) {
  const barcodeRef = useRef(null);

  // Get consignment id if available
  const parcelId =
    order?.steadfast_courier?.consignment_id ||
    order?.pathao_consignment_id ||
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

  // Format date & time
  const formatDT = (t) => {
    const d = new Date(t);
    return {
      date: d.toLocaleDateString("en-GB"),
      time: d.toLocaleTimeString("en-US", { hour12: true }),
    };
  };
  const dt = formatDT(order.created_at);

  // shop info fallback hierarchy
  const shop = session?.user?.invoice_settings || {};
  const userInfo = order?.user_info || {};
  const logo =
    shop.shop_logo ||
    shop.profile_pic ||
    userInfo.logo ||
    userInfo.profile_pic ||
    "/placeholder-shop.png";

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
      {/* === Row 1: Seller Info === */}
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
          <div style={{ fontSize: "14px" }}>
            <div style={{ fontWeight: "bold" }}>
              Shipped From:{" "}
              {shop.shop_name || userInfo.outlet_name || "Shop Name"}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "13px", marginTop: "6px" }}>
          <div>
            <b>Contact:</b> {shop.mobile_number || userInfo.phone || "N/A"}
          </div>
          <div>
            <b>Email:</b> {shop.email || userInfo.email || "N/A"}
          </div>
          <div>
            <b>Address:</b> {shop.shop_address || userInfo.address || "N/A"}
          </div>
          {userInfo.web_address && (
            <div>
              <b>Website:</b> {userInfo.web_address}
            </div>
          )}
        </div>
      </div>

      {/* === Row 2: Delivery Info === */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "13px",
          paddingTop: "6px",
          borderTop: "1px solid #ccc",
          alignItems: "center",
        }}
      >
        <div>
          <b>Name:</b> {order.delivery_customer_name}
        </div>
        <div>
          <b>Phone:</b> {order.delivery_customer_phone}
        </div>
        <div>
          <b>Address:</b> {order.delivery_customer_address}
        </div>
        {order.delivery_note && (
          <div>
            <b>Note:</b> {order.delivery_note}
          </div>
        )}
      </div>

      {/* === Row 3: Product + Amount + Barcode === */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          borderTop: "1px solid #ccc",
          paddingTop: "6px",
        }}
      >
        <div style={{ width: "60%" }}>
          <div>
            <b>Invoice:</b> {order.invoice_id}
          </div>

          {/* 🛒 Product list */}
          <div>
            <b>Products:</b>{" "}
            {Array.isArray(order.sales_details) && order.sales_details.length
              ? order.sales_details
                  .map((item) => {
                    const name = item?.product_info?.name || "";
                    const variant = item?.product_variant?.name;
                    const qty = item?.qty || 0;
                    return variant
                      ? `${name} (${variant}) x${qty}`
                      : `${name} x${qty}`;
                  })
                  .join(", ")
              : "N/A"}
          </div>

          <div>
            <b>Collectable Amount:</b> BDT{" "}
            {Number(order.sub_total + order.delivery_fee).toFixed(2)}
          </div>
          {order.pay_mode && (
            <div>
              <b>Payment:</b> {order.pay_mode}
            </div>
          )}
        </div>

        {/* 📦 Right Side: Barcode + Date */}
        <div style={{ width: "40%", textAlign: "center" }}>
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
