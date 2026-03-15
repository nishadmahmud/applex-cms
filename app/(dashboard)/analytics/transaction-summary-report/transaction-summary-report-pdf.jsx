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

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header
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
    backgroundColor: "#C7F48B",
    padding: 6,
  },
  td: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
  head: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  cell: { fontSize: 8, color: "#111827" },
  right: { textAlign: "right" },

  // Columns
  partCol: { width: "70%" },
  debitCol: { width: "15%" },
  creditCol: { width: "15%" },

  totalRow: { backgroundColor: "#F3F4F6" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function toLocalDateStr(d) {
  try {
    if (!d) return "-";
    // Expecting d like "YYYY-MM-DD"
    const dt = new Date(d);
    if (!isNaN(dt)) return dt.toISOString().slice(0, 10);
    return String(d).slice(0, 10);
  } catch {
    return "-";
  }
}

function Header({ user, meta = {} }) {
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

  const currency = meta?.currency || "BDT";
  const viewOrder = meta?.view_order || "asc";
  const startStr = toLocalDateStr(meta?.start_date);
  const endStr = toLocalDateStr(meta?.end_date);

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
          <Text style={styles.rightLine}>Report: Transaction Summary</Text>
          <Text style={styles.rightLine}>Currency: {currency}</Text>
          <Text style={styles.rightLine}>
            Period: {startStr} to {endStr}
          </Text>
          <Text style={styles.rightLine}>Order: {viewOrder.toUpperCase()}</Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Transaction Summary Report</Text>
    </>
  );
}

export default function TransactionSummaryReportPDF({
  rows = [],
  openingBalance = 0,
  closingBalance = 0,
  totals = { totalDebit: 0, totalCredit: 0 },
  apiTotals = { totalDebit: null, totalCredit: null },
  user,
  meta = {},
}) {
  const openingDebit = openingBalance > 0 ? openingBalance : 0;
  const openingCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;
  const closingDebit = closingBalance > 0 ? closingBalance : 0;
  const closingCredit = closingBalance < 0 ? Math.abs(closingBalance) : 0;

  const showDebit = Number.isFinite(apiTotals?.totalDebit)
    ? apiTotals.totalDebit
    : totals.totalDebit;
  const showCredit = Number.isFinite(apiTotals?.totalCredit)
    ? apiTotals.totalCredit
    : totals.totalCredit;

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} meta={meta} />

        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.partCol]}>
              <Text style={styles.head}>Particulars</Text>
            </View>
            <View style={[styles.th, styles.debitCol]}>
              <Text style={[styles.head, styles.right]}>Debit</Text>
            </View>
            <View style={[styles.th, styles.creditCol]}>
              <Text style={[styles.head, styles.right]}>Credit</Text>
            </View>
          </View>

          {/* Opening Balance */}
          <View style={styles.row}>
            <View style={[styles.td, styles.partCol]}>
              <Text style={[styles.cell]}>Opening Balance</Text>
            </View>
            <View style={[styles.td, styles.debitCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(openingDebit)}
              </Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(openingCredit)}
              </Text>
            </View>
          </View>

          {/* Transactions */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.partCol]}>
                <Text style={styles.cell}>
                  {r.desc || r.particulars || "-"}
                </Text>
              </View>
              <View style={[styles.td, styles.debitCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.debit)}
                </Text>
              </View>
              <View style={[styles.td, styles.creditCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.credit)}
                </Text>
              </View>
            </View>
          ))}

          {/* Current Totals */}
          <View style={[styles.row, styles.totalRow]}>
            <View style={[styles.td, styles.partCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Current Total
              </Text>
            </View>
            <View style={[styles.td, styles.debitCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(showDebit)}
              </Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(showCredit)}
              </Text>
            </View>
          </View>

          {/* Closing Balance */}
          <View style={styles.row}>
            <View style={[styles.td, styles.partCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Closing Balance
              </Text>
            </View>
            <View style={[styles.td, styles.debitCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(closingDebit)}
              </Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(closingCredit)}
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
