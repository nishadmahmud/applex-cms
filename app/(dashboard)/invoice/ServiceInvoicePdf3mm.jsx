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

export default function ServiceInvoicePdf3mm({
  qrDataUrl,
  service,
  user,
  logoUrl,
  termsData,
  session,
}) {
  const d = service || {};
  const invUser = d.user_info || {};
  const settings = invUser.invoice_settings || {};

  const customer = d.customers || {};
  const items = d.service_details || [];

  const fees = Number(d.fees || 0);
  const vat = Number(d.vat || 0);
  const tax = Number(d.tax || 0);
  const discount = Number(d.discount || 0);
  const total = Number(d.total || 0);
  const paid = Number(d.paid_amount || 0);
  const due = Number(d.due_amount || 0);

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
      color: due > 0 ? "#b91c1c" : undefined,
    },
  ];

  return (
    <Document>
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
            Hotline: {session?.user?.phone || invUser.phone || "N/A"}
          </Text>
          {d.service_invoice_id && (
            <Text style={[styles.shopLine, { fontWeight: "bold" }]}>
              Service ID: {d.service_invoice_id}
            </Text>
          )}
        </View>

        <View style={styles.dashed} />

        {/* ---------- BASIC INFO ---------- */}
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text>
            {d.created_at ? new Date(d.created_at).toLocaleString() : "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text numberOfLines={1}>{customer.name || "Walk-in"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text numberOfLines={1}>{customer.mobile_number || "N/A"}</Text>
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
            (item.technician_list || []).map((t) => t.name).join(", ") || "—";

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
                  fontWeight: row.bold ? "bold" : "bold",
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
