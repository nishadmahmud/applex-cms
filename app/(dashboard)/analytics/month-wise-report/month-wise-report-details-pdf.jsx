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

// Keep words/numbers intact (avoid hyphenation)
Font.registerHyphenationCallback((word) => [word]);

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header (left: shop, right: meta)
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
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
    marginBottom: 8,
  },

  // Section header
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },

  // Table
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
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

  // Totals row
  totalRow: { backgroundColor: "#E5E7EB" },

  // Sales: Invoice | Customer | Amount (BDT)  (landscape widths sum to 100)
  sInvCol: { width: "40%" },
  sPartyCol: { width: "35%" },
  sAmtCol: { width: "25%" },

  // Purchase: Invoice | Vendor | Amount
  pInvCol: { width: "40%" },
  pPartyCol: { width: "35%" },
  pAmtCol: { width: "25%" },

  // Payments: Type | Invoice | Status | Amount
  payTypeCol: { width: "25%" },
  payInvCol: { width: "35%" },
  payStatusCol: { width: "15%" },
  payAmtCol: { width: "25%" },

  // Page number
  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

// Header component
function Header({ user, monthName, year }) {
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
          <Text style={styles.rightLine}>Report: Month-wise Details</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {monthName || "-"} {year || ""}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Month-wise Details Report</Text>
    </>
  );
}

// Simple total calc
const sum = (arr, key) =>
  arr.reduce(
    (s, r) => s + (Number.isFinite(Number(r?.[key])) ? Number(r?.[key]) : 0),
    0
  );

// Details PDF (LANDSCAPE)
export default function MonthWiseReportDetailsPDF({
  user,
  monthName,
  year,
  salesInvoices = [], // [{ invoiceId, party, amount }]
  purchaseInvoices = [], // [{ invoiceId, party, amount }]
  paymentTransactions = [], // [{ paymentType, invoiceId, status, amount }]
}) {
  const salesTotal = sum(salesInvoices, "amount");
  const purchaseTotal = sum(purchaseInvoices, "amount");
  const paymentsTotal = sum(paymentTransactions, "amount");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Header user={user} monthName={monthName} year={year} />

        {/* Sales Invoices */}
        <Text style={styles.sectionTitle}>Sales Invoices (Details)</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.sInvCol]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
            <View style={[styles.th, styles.sPartyCol]}>
              <Text style={styles.head}>Customer</Text>
            </View>
            <View style={[styles.th, styles.sAmtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (BDT)
              </Text>
            </View>
          </View>

          {salesInvoices.map((r, i) => (
            <View style={styles.row} key={`s-${i}`}>
              <View style={[styles.td, styles.sInvCol]}>
                <Text style={styles.cell}>{r?.invoiceId || ""}</Text>
              </View>
              <View style={[styles.td, styles.sPartyCol]}>
                <Text style={styles.cell}>{r?.party || ""}</Text>
              </View>
              <View style={[styles.td, styles.sAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.amount)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <View style={[styles.td, styles.sInvCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Total</Text>
            </View>
            <View style={[styles.td, styles.sPartyCol]} />
            <View style={[styles.td, styles.sAmtCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt(salesTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Purchase Invoices */}
        <Text style={styles.sectionTitle}>Purchase Invoices (Details)</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.pInvCol]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
            <View style={[styles.th, styles.pPartyCol]}>
              <Text style={styles.head}>Vendor</Text>
            </View>
            <View style={[styles.th, styles.pAmtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (BDT)
              </Text>
            </View>
          </View>

          {purchaseInvoices.map((r, i) => (
            <View style={styles.row} key={`p-${i}`}>
              <View style={[styles.td, styles.pInvCol]}>
                <Text style={styles.cell}>{r?.invoiceId || ""}</Text>
              </View>
              <View style={[styles.td, styles.pPartyCol]}>
                <Text style={styles.cell}>{r?.party || ""}</Text>
              </View>
              <View style={[styles.td, styles.pAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.amount)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <View style={[styles.td, styles.pInvCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Total</Text>
            </View>
            <View style={[styles.td, styles.pPartyCol]} />
            <View style={[styles.td, styles.pAmtCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt(purchaseTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Transactions */}
        <Text style={styles.sectionTitle}>Payment Transactions (Details)</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, styles.payTypeCol]}>
              <Text style={styles.head}>Payment Type</Text>
            </View>
            <View style={[styles.th, styles.payInvCol]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
            <View style={[styles.th, styles.payStatusCol]}>
              <Text style={styles.head}>Status</Text>
            </View>
            <View style={[styles.th, styles.payAmtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (BDT)
              </Text>
            </View>
          </View>

          {paymentTransactions.map((r, i) => (
            <View style={styles.row} key={`pt-${i}`}>
              <View style={[styles.td, styles.payTypeCol]}>
                <Text style={styles.cell}>{r?.paymentType || ""}</Text>
              </View>
              <View style={[styles.td, styles.payInvCol]}>
                <Text style={styles.cell}>{r?.invoiceId || ""}</Text>
              </View>
              <View style={[styles.td, styles.payStatusCol]}>
                <Text style={styles.cell}>{r?.status || ""}</Text>
              </View>
              <View style={[styles.td, styles.payAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.amount)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <View style={[styles.td, styles.payTypeCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Total</Text>
            </View>
            <View style={[styles.td, styles.payInvCol]} />
            <View style={[styles.td, styles.payStatusCol]} />
            <View style={[styles.td, styles.payAmtCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt(paymentsTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Page number */}
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
