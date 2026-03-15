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
    color: "#000",
    fontSize: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    lineHeight: 1.35,
  },

  header: { alignItems: "center", textAlign: "center", marginBottom: 6 },
  logo: { width: 55, height: 30, objectFit: "contain", marginBottom: 4 },
  shopName: { fontSize: 10, fontWeight: "bold" },
  shopLine: { fontSize: 8, color: "#000", fontWeight: "bold" },

  dashed: {
    borderBottomWidth: 0.8,
    borderBottomStyle: "dashed",
    borderBottomColor: "#000",
    marginVertical: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  label: { fontWeight: "bold", color: "#000" },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomStyle: "dashed",
    borderBottomColor: "#000",
    paddingBottom: 2,
    marginBottom: 3,
  },
  th: { width: "25%", textAlign: "center", fontWeight: "bold", color: "#000" },
  itemRow: { flexDirection: "row", marginBottom: 2 },
  tdName: { width: "40%", textAlign: "left", fontWeight: "bold", color: "#000" },
  td: { width: "20%", textAlign: "center", fontWeight: "bold", color: "#000" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1.5,
  },
  totalLabel: { fontSize: 7.5, fontWeight: "bold", color: "#000" },
  totalVal: { fontSize: 7.5, fontWeight: "bold", color: "#000" },

  footer: { textAlign: "center", marginTop: 8 },
  footerText: { fontSize: 7, color: "#000", fontWeight: "bold", marginTop: 2 },
});

export default function ServiceInvoicePdf2mm({
  qrDataUrl,
  service,
  user,
  logoUrl,
  termsData,
  session,
}) {
  const d = service;
  const invUser = d?.user_info || user || {};
  const settings = invUser?.invoice_settings || user?.invoice_settings || {};

  const shopName = settings.shop_name || invUser.outlet_name || "Shop Name";
  const shopAddress = settings.shop_address || invUser.address || "Shop Address";
  const hotline = invUser.phone || session?.user?.phone || "N/A";

  const customer = d?.customers || {};
  const customerName = customer?.name || "Walk-in";
  const customerPhone = customer?.mobile_number || customer?.phone || "N/A";

  const dateStr = d?.created_at
    ? new Date(d.created_at).toLocaleString()
    : "-";

  const items = d?.service_details || [];
  const fees = Number(d?.fees || 0);
  const discount = Number(d?.discount || 0);
  const vat = Number(d?.vat || 0);
  const tax = Number(d?.tax || 0);
  const total = Number(d?.total || 0);
  const paid = Number(d?.paid_amount || 0);
  const due = Number(d?.due_amount || 0);

  const totals = [
    { label: "Service Fees", val: fees },
    { label: "Discount", val: -discount },
    { label: "VAT", val: vat },
    { label: "Tax", val: tax },
    { label: "Grand Total", val: total, bold: true },
    { label: "Paid Amount", val: -paid },
    {
      label: "Due Amount",
      val: due,
      bold: true,
      color: due > 0 ? "#B91C1C" : "#000",
    },
  ];

  return (
    <Document>
      <Page size={[164, 842]} style={styles.page}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.shopName}>{shopName}</Text>
          <Text style={styles.shopLine}>{shopAddress}</Text>
          <Text style={styles.shopLine}>Hotline: {hotline}</Text>
          {d?.service_invoice_id && (
            <Text style={[styles.shopLine, { fontWeight: "bold" }]}>
              Service ID: {d.service_invoice_id}
            </Text>
          )}
        </View>

        <View style={styles.dashed} />

        {/* ---------- BASIC INFO ---------- */}
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text>{dateStr}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text numberOfLines={1}>{customerName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text numberOfLines={1}>{customerPhone}</Text>
        </View>

        <View style={styles.dashed} />

        {/* ---------- ITEMS TABLE ---------- */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: "40%", textAlign: "left" }]}>
            Product
          </Text>
          <Text style={[styles.th, { width: "20%" }]}>Tech</Text>
          <Text style={[styles.th, { width: "20%" }]}>Qty</Text>
          <Text style={[styles.th, { width: "20%" }]}>Fees</Text>
        </View>

        {items.map((item, idx) => {
          const name = item.product_info?.name || `Product #${item.product_id}`;
          const techs =
            (item.technician_list || item.technicians || [])
              .map((t) => t.name)
              .join(", ") || "—";

          return (
            <View key={item.id || idx} style={styles.itemRow}>
              <Text style={styles.tdName}>{name}</Text>
              <Text style={styles.td}>{techs}</Text>
              <Text style={styles.td}>{item.servicing_unit}</Text>
              <Text style={styles.td}>{idx === 0 ? fmt(fees) : "—"}</Text>
            </View>
          );
        })}

        {items.length === 0 && (
          <View style={styles.itemRow}>
            <Text style={styles.tdName}>Service Charge</Text>
            <Text style={styles.td}>—</Text>
            <Text style={styles.td}>—</Text>
            <Text style={styles.td}>{fmt(fees)}</Text>
          </View>
        )}

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
            Thank you for using our service
          </Text>
          <Text style={[styles.footerText, { fontWeight: "bold" }]}>
            A Product of SQUAD INNOVATORS
          </Text>
        </View>
      </Page>
    </Document>
  );
}
