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

Font.registerHyphenationCallback((word) => [word]);

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header (left shop, right meta)
  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 8,
    marginBottom: 10,
  },
  leftInfo: { width: "60%", flexDirection: "row", alignItems: "center" },
  logoWrap: {
    width: 60,
    height: 45,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 60, height: 45, objectFit: "contain" },
  leftText: { flex: 1 },
  shopName: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 8, color: "#374151", marginTop: 2 },
  contact: { fontSize: 8, color: "#4B5563", marginTop: 2 },

  rightInfo: { width: "38%", alignItems: "flex-end" },
  rightLine: { fontSize: 8, color: "#374151", lineHeight: 1.2 },

  title: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  // Table
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  row: { flexDirection: "row" },
  th: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F3F4F6",
    padding: 5,
  },
  td: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  head: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  cell: { fontSize: 7, color: "#111827" },
  right: { textAlign: "right" },

  // Column widths (sum 100), amounts widened to avoid wrapping
  dateCol: { width: "18%" },
  invCol: { width: "28%" },
  qtyCol: { width: "10%" },
  subCol: { width: "16%" },
  paidCol: { width: "14%" },
  dueCol: { width: "14%" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function Header({ user, filters, customerLabel }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const logo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
  const email = inv?.email || u?.email || "";
  const web = inv?.web_address || u?.web_address || "";

  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;
  const start = (filters?.start_date || "").toString().slice(0, 10);
  const end = (filters?.end_date || "").toString().slice(0, 10);

  return (
    <>
      <View style={styles.headerWrap}>
        <View style={styles.leftInfo}>
          <View style={styles.logoWrap}>
            {logo ? (
              <Image src={logo} style={styles.logo} />
            ) : (
              <Text style={{ fontSize: 9, color: "#6B7280" }}>No Logo</Text>
            )}
          </View>
          <View style={styles.leftText}>
            <Text style={styles.shopName}>{shopName}</Text>
            {!!address && <Text style={styles.address}>{address}</Text>}
            <Text style={styles.contact}>
              {phone ? `Phone: ${phone}` : ""}{" "}
              {email ? `| Email: ${email}` : ""} {web ? `| Web: ${web}` : ""}
            </Text>
          </View>
        </View>
        <View style={styles.rightInfo}>
          <Text style={styles.rightLine}>Report: Customer Summary</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>Customer: {customerLabel || "-"}</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Customer Summary Report</Text>
    </>
  );
}

export default function CustomerSummaryReportPDF({
  rows = [],
  totals = { totalQty: 0, totalSub: 0, totalPaid: 0, totalDue: 0 },
  filters,
  user,
  customerLabel = "",
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} customerLabel={customerLabel} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.dateCol]}>
              <Text style={styles.head}>Date</Text>
            </View>
            <View style={[styles.th, styles.invCol]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
            <View style={[styles.th, styles.qtyCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Qty
              </Text>
            </View>
            <View style={[styles.th, styles.subCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Sub Total (BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.paidCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Paid (BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.dueCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Due (BDT)
              </Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.dateCol]}>
                <Text style={styles.cell}>{r.date}</Text>
              </View>
              <View style={[styles.td, styles.invCol]}>
                <Text style={styles.cell}>{r.invoiceId}</Text>
              </View>
              <View style={[styles.td, styles.qtyCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.qty)}
                </Text>
              </View>
              <View style={[styles.td, styles.subCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.subTotal)}
                </Text>
              </View>
              <View style={[styles.td, styles.paidCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.paid)}
                </Text>
              </View>
              <View style={[styles.td, styles.dueCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.due)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.dateCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Totals</Text>
            </View>
            <View style={[styles.td, styles.invCol]} />
            <View style={[styles.td, styles.qtyCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalQty)}
              </Text>
            </View>
            <View style={[styles.td, styles.subCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalSub)}
              </Text>
            </View>
            <View style={[styles.td, styles.paidCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalPaid)}
              </Text>
            </View>
            <View style={[styles.td, styles.dueCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalDue)}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={styles.pageNum}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
