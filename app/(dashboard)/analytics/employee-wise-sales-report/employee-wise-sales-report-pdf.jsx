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
  center: { textAlign: "center" },

  totalRow: { backgroundColor: "#E5E7EB" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

// Columns (sum flex to 100)
const FLEX = {
  sl: 6,
  date: 18,
  voucher: 22,
  products: 36,
  amount: 18,
};

function toLocalDateStr(d) {
  try {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toISOString().slice(0, 10);
  } catch {
    return String(d || "");
  }
}
function toLocalDateTimeStr(d) {
  try {
    const dd = new Date(d);
    if (isNaN(dd)) return "-";
    const date = dd.toISOString().slice(0, 10);
    const time = dd.toTimeString().slice(0, 8);
    return `${date} ${time}`;
  } catch {
    return "-";
  }
}

function Header({ user, filters, employeeLabel }) {
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

  const start = filters?.start_date
    ? toLocalDateTimeStr(filters.start_date)
    : "-";
  const end = filters?.end_date ? toLocalDateTimeStr(filters.end_date) : "-";

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
          <Text style={styles.rightLine}>Report: Employee Wise Sales</Text>
          <Text style={styles.rightLine}>Employee: {employeeLabel || "-"}</Text>
          <Text style={styles.rightLine}>
            Period: {start} to {end}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Employee Wise Sales</Text>
    </>
  );
}

export default function EmployeeWiseSalesReportPDF({
  rows = [],
  totals = { grandTotal: 0, percent: 0, fixed: 0, payable: 0 },
  user,
  filters = { start_date: null, end_date: null },
  employeeLabel = "",
}) {
  const gt = Number(totals?.grandTotal ?? 0);
  const percent = Number(totals?.percent ?? 0);
  const fixed = Number(totals?.fixed ?? 0);
  const payable = Number(totals?.payable ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header user={user} filters={filters} employeeLabel={employeeLabel} />

        <View style={styles.table}>
          {/* header */}
          <View style={styles.row}>
            <View style={[styles.th, { flex: FLEX.sl }]}>
              <Text style={[styles.head, styles.center]}>SL</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.date }]}>
              <Text style={styles.head}>Transaction Date</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.voucher }]}>
              <Text style={styles.head}>Voucher Number</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.products }]}>
              <Text style={styles.head}>Products</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.amount }]}>
              <Text style={[styles.head, styles.right]}>
                Sales Amount (BDT)
              </Text>
            </View>
          </View>

          {/* rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, { flex: FLEX.sl }]}>
                <Text style={[styles.cell, styles.center]}>{i + 1}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.date }]}>
                <Text style={styles.cell}>{toLocalDateStr(r.date)}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.voucher }]}>
                <Text style={styles.cell}>{r.invoiceId}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.products }]}>
                <Text style={styles.cell}>{r.products}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.amount }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.amount)}
                </Text>
              </View>
            </View>
          ))}

          {/* summary rows */}
          <View style={[styles.row, styles.totalRow]}>
            <View
              style={[
                styles.td,
                { flex: FLEX.sl + FLEX.date + FLEX.voucher + FLEX.products },
              ]}
            >
              <Text style={[styles.cell]}>Grand Total</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.amount }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(gt)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.td,
                { flex: FLEX.sl + FLEX.date + FLEX.voucher + FLEX.products },
              ]}
            >
              <Text style={styles.cell}>Percentage</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.amount }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(percent)} %
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.td,
                { flex: FLEX.sl + FLEX.date + FLEX.voucher + FLEX.products },
              ]}
            >
              <Text style={styles.cell}>Fixed</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.amount }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(fixed)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.td,
                { flex: FLEX.sl + FLEX.date + FLEX.voucher + FLEX.products },
              ]}
            >
              <Text style={styles.cell}>Payable</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.amount }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(payable)}
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
