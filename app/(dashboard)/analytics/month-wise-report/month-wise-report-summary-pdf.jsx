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

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#FFFFFF" },

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
  rightLine: { fontSize: 8, color: "#374151", lineHeight: 1.3 },

  title: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  // KPI row
  kpiWrap: { flexDirection: "row", gap: 6, marginTop: 8 },
  kpiCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    padding: 8,
    borderRadius: 3,
  },
  kpiLabel: { fontSize: 8, color: "#6B7280" },
  kpiValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },

  // Table
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
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

  // Column widths
  cCol: { width: "60%" },
  numCol: { width: "20%" },
  amtCol: { width: "20%" },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 12,
  },
  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

function Header({ user, monthName, year }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName = inv?.shop_name || u?.outlet_name || "Outlet / Company";
  const logo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
  const email = inv?.email || u?.email || "";
  const web = inv?.web_address || u?.web_address || "";
  const gen = new Date();

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
          <Text style={styles.rightLine}>
            Report: Month-wise Financial Summary
          </Text>
          <Text style={styles.rightLine}>
            Period: {monthName} {year}
          </Text>
          <Text style={styles.rightLine}>
            Generated: {gen.toISOString().slice(0, 10)}{" "}
            {gen.toTimeString().slice(0, 8)}
          </Text>
        </View>
      </View>
      <Text style={styles.title}>Month-wise Financial Summary</Text>
    </>
  );
}

export default function MonthWiseReportSummaryPDF({
  user,
  monthName,
  year,
  summary,
  salesSummary = [],
  purchaseSummary = [],
  paymentSummary = [],
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} monthName={monthName} year={year} />

        {/* KPIs */}
        <View style={styles.kpiWrap}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Sales (BDT)</Text>
            <Text style={styles.kpiValue}>{fmt0(summary?.totalSales)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Purchases (BDT)</Text>
            <Text style={styles.kpiValue}>{fmt0(summary?.totalPurchase)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Payments Debit (BDT)</Text>
            <Text style={styles.kpiValue}>
              {fmt0(summary?.totalPaymentDebit)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>
              Net Movement (Sales - Purchases)
            </Text>
            <Text style={styles.kpiValue}>{fmt0(summary?.netMovement)}</Text>
          </View>
        </View>

        {/* Sales Summary */}
        <Text style={styles.sectionTitle}>Sales Summary (by Customer)</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.cCol]}>
              <Text style={styles.head}>Customer</Text>
            </View>
            <View style={[styles.th, styles.numCol]}>
              <Text style={[styles.head, styles.right]}>Invoices</Text>
            </View>
            <View style={[styles.th, styles.amtCol]}>
              <Text style={[styles.head, styles.right]}>Amount (BDT)</Text>
            </View>
          </View>
          {salesSummary.map((r, i) => (
            <View style={styles.row} key={`s-${i}`}>
              <View style={[styles.td, styles.cCol]}>
                <Text style={styles.cell}>{r.customerName}</Text>
              </View>
              <View style={[styles.td, styles.numCol]}>
                <Text style={[styles.cell, styles.right]}>
                  {fmt0(r.invoicesCount)}
                </Text>
              </View>
              <View style={[styles.td, styles.amtCol]}>
                <Text style={[styles.cell, styles.right]}>
                  {fmt0(r.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Purchases Summary */}
        <Text style={styles.sectionTitle}>Purchase Summary (by Vendor)</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.cCol]}>
              <Text style={styles.head}>Vendor</Text>
            </View>
            <View style={[styles.th, styles.numCol]}>
              <Text style={[styles.head, styles.right]}>Invoices</Text>
            </View>
            <View style={[styles.th, styles.amtCol]}>
              <Text style={[styles.head, styles.right]}>Amount (BDT)</Text>
            </View>
          </View>
          {purchaseSummary.map((r, i) => (
            <View style={styles.row} key={`p-${i}`}>
              <View style={[styles.td, styles.cCol]}>
                <Text style={styles.cell}>{r.vendorName}</Text>
              </View>
              <View style={[styles.td, styles.numCol]}>
                <Text style={[styles.cell, styles.right]}>
                  {fmt0(r.invoicesCount)}
                </Text>
              </View>
              <View style={[styles.td, styles.amtCol]}>
                <Text style={[styles.cell, styles.right]}>
                  {fmt0(r.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payments Summary */}
        <Text style={styles.sectionTitle}>Payments Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.cCol]}>
              <Text style={styles.head}>Payment Type</Text>
            </View>
            <View style={[styles.th, styles.numCol]}>
              <Text style={[styles.head, styles.right]}>Debit (BDT)</Text>
            </View>
            <View style={[styles.th, styles.numCol]}>
              <Text style={[styles.head, styles.right]}>Credit (BDT)</Text>
            </View>
          </View>
          {paymentSummary.map((r, i) => (
            <View style={styles.row} key={`pm-${i}`}>
              <View style={[styles.td, styles.cCol]}>
                <Text style={styles.cell}>{r.paymentType}</Text>
              </View>
              <View style={[styles.td, styles.numCol]}>
                <Text style={[styles.cell, styles.right]}>{fmt0(r.debit)}</Text>
              </View>
              <View style={[styles.td, styles.numCol]}>
                <Text style={[styles.cell, styles.right]}>
                  {fmt0(r.credit)}
                </Text>
              </View>
            </View>
          ))}
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
