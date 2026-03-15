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

// Avoid hyphenation/splitting
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 10,
  },
  logoWrap: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: { width: 80, height: 60, objectFit: "contain" },
  brandCenter: { flex: 1, textAlign: "center" },
  shopName: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 8, color: "#374151", marginTop: 2 },
  contactRow: { fontSize: 8, color: "#4B5563", marginTop: 2 },

  brandRight: { width: 200, alignItems: "flex-end" },
  rightText: {
    fontSize: 7,
    color: "#374151",
    lineHeight: 1.15,
    textAlign: "right",
  },

  title: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
  },

  metaRow: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: { fontSize: 8, color: "#374151" },
  metaStrong: { fontWeight: "bold", color: "#111827" },

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
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F3F4F6",
    padding: 5,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  tableCell: { fontSize: 7, color: "#111827" },
  centerText: { textAlign: "center" },

  // Column widths (sum 100)
  particularsCol: { width: "40%" },
  debitCol: { width: "20%" },
  creditCol: { width: "20%" },
  closingCol: { width: "20%" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmtInt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
    useGrouping: false,
  });

const fmtDec = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    useGrouping: false,
  });

function Header({ user, filters }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const shopLogo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || u?.contact_number || "";
  const email = inv?.email || u?.email || "";
  const website = inv?.web_address || u?.web_address || "";
  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;

  const startDate = (filters?.start_date || "").toString().slice(0, 10);
  const endDate = (filters?.end_date || "").toString().slice(0, 10);

  return (
    <>
      <View style={styles.brandHeader}>
        <View style={styles.logoWrap}>
          {shopLogo ? (
            <Image src={shopLogo} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 10, color: "#6B7280" }}>No Logo</Text>
          )}
        </View>
        <View style={styles.brandCenter}>
          <Text style={styles.shopName}>{shopName}</Text>
          {address ? <Text style={styles.address}>{address}</Text> : null}
          <Text style={styles.contactRow}>
            {phone ? `Phone: ${phone}` : ""} {email ? `| Email: ${email}` : ""}{" "}
            {website ? `| Web: ${website}` : ""}
          </Text>
        </View>
        <View style={styles.brandRight}>
          <Text style={styles.rightText} wrap={false}>
            Report: Ledger (Monthly)
          </Text>
          <Text style={styles.rightText} wrap={false}>
            Currency: BDT
          </Text>
          <Text style={styles.rightText} wrap={false}>
            Generated: {genStr}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Ledger Report History</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaItem}>
          <Text style={styles.metaStrong}>Period: </Text>
          {startDate || "-"} to {endDate || "-"}
        </Text>
      </View>
    </>
  );
}

export default function LedgerReportHistoryPDF({
  openingBalance = 0,
  rows = [],
  totals = { debit: 0, credit: 0, closingBalance: 0 },
  filters,
  user,
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.particularsCol]}>
              <Text style={styles.tableCellHeader}>Particulars</Text>
            </View>
            <View style={[styles.tableColHeader, styles.debitCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Debit
              </Text>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                (In BDT)
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.creditCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Credit
              </Text>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                (In BDT)
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.closingCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Closing Balance
              </Text>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                (In BDT)
              </Text>
            </View>
          </View>

          {/* Opening row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.particularsCol]}>
              <Text style={styles.tableCell}>Opening</Text>
            </View>
            <View style={[styles.tableCol, styles.debitCol]}>
              <Text style={[styles.tableCell, styles.rightText]}></Text>
            </View>
            <View style={[styles.tableCol, styles.creditCol]}>
              <Text style={[styles.tableCell, styles.rightText]}></Text>
            </View>
            <View style={[styles.tableCol, styles.closingCol]}>
              <Text style={[styles.tableCell, styles.rightText]}>
                {fmtDec(openingBalance)}
              </Text>
            </View>
          </View>

          {/* Monthly rows */}
          {rows.map((r, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={[styles.tableCol, styles.particularsCol]}>
                <Text style={styles.tableCell}>{r.particulars}</Text>
              </View>
              <View style={[styles.tableCol, styles.debitCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmtInt(r.debit)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.creditCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmtInt(r.credit)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.closingCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmtDec(r.closing_balance)}
                </Text>
              </View>
            </View>
          ))}

          {/* Grand total */}
          <View style={[styles.tableRow]}>
            <View style={[styles.tableCol, styles.particularsCol]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Grand Total
              </Text>
            </View>
            <View style={[styles.tableCol, styles.debitCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmtInt(totals.debit)}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.creditCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmtInt(totals.credit)}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.closingCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmtDec(totals.closingBalance)}
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
