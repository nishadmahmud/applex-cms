/* eslint-disable react/prop-types */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSerifBengali",
  fonts: [
    {
      src: "/fonts/NotoSerifBengali-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "/fonts/NotoSerifBengali-Bold.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
  ],
});

// use React‑PDF default font
Font.registerHyphenationCallback((word) => [word]);

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSerifBengali",
    backgroundColor: "#fff",
    fontWeight: "bold",
    color: "#111",
    fontSize: 8.2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    lineHeight: 1.35,
  },

  header: { alignItems: "center", textAlign: "center", marginBottom: 6 },
  logo: { width: 55, height: 30, objectFit: "contain", marginBottom: 4 },
  shopName: { fontSize: 11, fontWeight: "bold" },
  shopLine: { fontSize: 8, color: "#333" },

  dashed: {
    borderBottomWidth: 0.6,
    borderBottomStyle: "dashed",
    borderBottomColor: "#666",
    marginVertical: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  label: { fontWeight: "bold" },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.6,
    borderBottomStyle: "dashed",
    borderBottomColor: "#666",
    paddingBottom: 2,
    marginBottom: 3,
  },
  th: { width: "25%", textAlign: "center", fontWeight: "bold" },
  itemRow: { flexDirection: "row", marginBottom: 1.5 },
  tdName: { width: "40%", textAlign: "left" },
  td: { width: "20%", textAlign: "center" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },
  totalLabel: { fontSize: 8 },
  totalVal: { fontSize: 8 },
  footer: { textAlign: "center", marginTop: 6 },
  footerText: { fontSize: 7, color: "#222", marginTop: 1 },
});

const formatProductName = (item, invoice) => {
  let name = item?.product_info?.name || "Unnamed Product";

  if (
    item?.product_info?.have_product_variant ||
    item?.have_product_variant ||
    item?.product_variant
  ) {
    const variant = item.product_variant;
    if (variant?.name) name += ` - ${variant.name}`;
  }

  // ✅ NEW: Default Warranty logic
  const defWarranties = invoice?.data?.defaultwarranties;
  let warrantyName = "";
  if (Array.isArray(defWarranties)) {
    const wItem = defWarranties.find((w) => w.product_id === item.product_id);
    if (wItem?.warranty?.name) {
      warrantyName = wItem.warranty.name;
    }
  }

  // 🧹 Clean warranty from name if already exists
  if (warrantyName) {
    const pattern = `(${warrantyName})`;
    if (name.includes(pattern)) {
      name = name.replace(pattern, "").trim();
    } else if (name.includes(warrantyName)) {
      name = name.replace(warrantyName, "").trim();
    }
  }

  const imeis = item?.product_imei;
  if (Array.isArray(imeis) && imeis.length > 0) {
    const first = imeis[0];
    const parts = [];
    if (first.color) parts.push(first.color);
    if (first.storage) parts.push(first.storage);
    if (first.region) parts.push(first.region);
    if (parts.length > 0) name += ` (${parts.join(" / ")})`;
  }

  // ✅ Append Warranty at the END
  if (warrantyName) {
    name += ` (${warrantyName})`;
  }
  return name;
};

export default function SaleInvoicePdf3mm({
  orderId,
  invoice,
  session,
  termsData,
  logoUrl,
}) {
  const inv = invoice?.data || {};
  const settings = inv.user_info?.invoice_settings || {};

  // ---------- VALUES ----------
  const sub = Number(inv.sub_total || 0);
  const disc = Number(inv.discount || 0);
  const vat = Number(inv.vat || 0);
  const delv = Number(inv.delivery_fee || 0);
  const tax = Number(inv.tax || 0);
  const paid = Number(inv.paid_amount || 0);
  const exchangeImeis = inv.exchange_imeis || [];

  // 🧮 calculate exchange total
  const exchangeTotal = Array.isArray(exchangeImeis)
    ? exchangeImeis.reduce(
      (sum, ex) => sum + Number(ex?.purchase_price || 0),
      0,
    )
    : 0;

  const adjustedSub = sub - exchangeTotal;
  // --------------------------------------
  // ✅ Cash Change Logic (match main SaleInvoice)
  // --------------------------------------
  const total = adjustedSub - disc + vat + tax + delv;

  const rawChange = inv?.cash_change;
  const hasChange =
    rawChange !== null &&
    rawChange !== undefined &&
    rawChange !== "" &&
    Number(rawChange) > 0;

  const changeAmount = hasChange ? Number(rawChange) : 0;
  // If customer overpaid → due = 0, else normal formula
  const due = hasChange ? 0 : Math.max(total - paid, 0);

  // ---------- TOTALS ----------
  const totals = [
    { label: "Sub Total", val: sub },
    ...(exchangeTotal > 0
      ? [
        {
          label: "(-) Exchange Value",
          val: -exchangeTotal,
          color: "#b91c1c",
        },
        { label: "Adjusted Subtotal", val: adjustedSub },
      ]
      : []),
    { label: "Discount", val: -disc },
    { label: "VAT", val: vat },
    { label: "Service Charge", val: tax },
    { label: "Delivery Fee", val: delv }, // ✅ ensure Delivery Fee always shown
    { label: "Grand Total", val: total, bold: true },
    { label: "Paid Amount", val: -paid },
    ...(changeAmount > 0
      ? [
        {
          label: "Change Amount",
          val: changeAmount,
          bold: true,
          color: "#059669",
        },
      ]
      : [
        {
          label: "Due Amount",
          val: due,
          bold: true,
          color: "#b91c1c",
        },
      ]),
  ];

  const parcelId = inv?.stead_fast_courier?.consignment_id;

  return (
    <Document>
      {/* 80 mm width (~226 pt) x 297 mm (~842 pt) */}
      <Page size={[226, 842]} style={styles.page}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.shopName}>
            {settings.shop_name || "Shop Name"}
          </Text>
          <Text style={styles.shopLine}>
            {settings.shop_address || "Shop Address"}
          </Text>
          <Text style={styles.shopLine}>
            Hotline: {session?.user?.phone || "N/A"}
          </Text>
          {/* ✅ Invoice ID directly beneath Hotline */}
          {inv.invoice_id && (
            <Text style={[styles.shopLine, { fontWeight: "bold" }]}>
              Invoice ID: {inv.invoice_id}
            </Text>
          )}
        </View>

        <View style={styles.dashed} />

        {/* ---------- BASIC INFO ---------- */}
        {parcelId ? (
          <View style={styles.row}>
            <Text style={styles.label}>Parcel ID:</Text>
            <Text>{parcelId}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text>
            {inv.created_at ? new Date(inv.created_at).toLocaleString() : "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text numberOfLines={1}>{inv.customer_name || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text numberOfLines={1}>{inv.customer_phone || "N/A"}</Text>
        </View>

        <View style={styles.dashed} />

        {/* ---------- ITEMS TABLE ---------- */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: "40%", textAlign: "left" }]}>
            Product
          </Text>
          <Text style={[styles.th, { width: "20%" }]}>Wty</Text>
          <Text style={[styles.th, { width: "20%" }]}>Qty</Text>
          <Text style={[styles.th, { width: "20%" }]}>Total</Text>
        </View>

        {inv.sales_details?.map((item, idx) => {
          const qty = Number(item?.qty || 0);
          const price = Number(item?.price || 0);
          return (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.tdName}>{formatProductName(item, inv)}</Text>
              <Text style={styles.td}>
                {item?.warranties_count || item?.product_info?.warrenty || "-"}
              </Text>
              <Text style={styles.td}>{qty}</Text>
              <Text style={styles.td}>{fmt(qty * price)}</Text>
            </View>
          );
        })}

        {/* ✅ Exchange items */}
        {Array.isArray(exchangeImeis) &&
          exchangeImeis.length > 0 &&
          exchangeImeis.map((ex, idx) => (
            <View
              key={`exchange-${ex.id}`}
              style={[
                styles.itemRow,
                {
                  backgroundColor: "#FEE2E2",
                  borderRadius: 2,
                  paddingVertical: 2,
                },
              ]}
            >
              <View
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  paddingRight: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: "bold",
                    color: "#B91C1C",
                    lineHeight: 1.2,
                  }}
                >
                  {ex.product_name}
                </Text>

                {ex.imei && (
                  <Text
                    style={{
                      fontSize: 7,
                      color: "#DC2626",
                      marginTop: 1,
                    }}
                  >
                    IMEI: {ex.imei} (Exchanged Product)
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.td,
                  { width: "20%", color: "#B91C1C", textAlign: "center" },
                ]}
              >
                1
              </Text>

              <Text
                style={[
                  styles.td,
                  { width: "20%", color: "#B91C1C", textAlign: "right" },
                ]}
              >
                (-) {fmt(ex.purchase_price || 0)}
              </Text>
            </View>
          ))}

        <View style={styles.dashed} />

        {/* ---------- TOTALS ---------- */}
        {totals.map((row, idx) => (
          <View key={idx} style={styles.totalRow}>
            <Text
              style={[
                styles.totalLabel,
                {
                  fontWeight: "bold",
                  color: row.color || "#000",
                },
              ]}
            >
              {row.label}
            </Text>
            <Text
              style={[
                styles.totalVal,
                {
                  fontWeight: "bold",
                  color: row.color || "#000",
                },
              ]}
            >
              {fmt(row.val)}
            </Text>
          </View>
        ))}

        <View style={styles.dashed} />

        {/* ---------- FOOTER ---------- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            In words: {Number(total).toFixed(2)} taka only
          </Text>
          <Text style={styles.footerText}>
            You saved {fmt(disc)} BDT in this purchase
          </Text>
          <Text style={styles.footerText}>Thank you for your purchase</Text>
          <Text style={[styles.footerText, { fontWeight: "bold" }]}>
            A Product of SQUAD INNOVATORS
          </Text>
        </View>
      </Page>
    </Document>
  );
}
