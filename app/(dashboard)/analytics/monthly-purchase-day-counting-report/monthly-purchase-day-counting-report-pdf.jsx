import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },

  // Brand Header
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginBottom: 2,
  },
  logoWrap: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: {
    width: 80,
    height: 60,
    objectFit: "contain",
  },
  brandCenter: {
    flex: 1,
    textAlign: "center",
  },
  shopName: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 8, color: "#374151", marginTop: 2 },
  contactRow: {
    fontSize: 8,
    color: "#4B5563",
    marginTop: 2,
  },
  brandRight: {
    width: 150,
    alignItems: "flex-end",
  },
  rightText: { fontSize: 8, color: "#374151" },

  // Title and Meta
  title: {
    fontSize: 13,
    marginTop: 3,
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
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F3F4F6",
    padding: 5,
  },
  tableCol: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  tableCell: { fontSize: 7, color: "#111827" },
  summaryRow: {
    backgroundColor: "#F9FAFB",
    fontWeight: "bold",
  },

  // Column width overrides (sum to 100%)
  slCol: { width: "5%" },
  dateCol: { width: "12%" },
  voucherCol: { width: "20%" },
  vendorCol: { width: "13%" },
  productCol: { width: "32%" },
  imeiCol: { width: "10%" },
  purchaseCol: { width: "8%" },

  // Align
  centerText: { textAlign: "center" },
  rightAlign: { textAlign: "right" },

  // Footer signature
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBlock: {
    width: "45%",
    alignItems: "flex-start",
  },
  signLine: {
    marginTop: 30,
    width: 180,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  signLabel: { fontSize: 8, color: "#374151", marginTop: 4 },
  signName: { fontSize: 9, color: "#111827", fontWeight: "bold" },
  signImage: { width: 100, height: 30, objectFit: "contain", marginBottom: 4 },

  // Page number
  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function MonthlyPurchaseDayCountingReportPDF({ data, totals, filters, user }) {
  // User and invoice settings
  const u = user || {};
  const inv = u?.invoice_settings || {};

  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const shopLogo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || u?.contact_number || "";
  const email = inv?.email || u?.email || "";
  const website = inv?.web_address || u?.web_address || "";

  const signUrl = inv?.sign_authority || u?.signature;
  const signName = inv?.name_authority || u?.owner_name || "";

  // Dates
  const startDate = (filters?.start_date || "").toString().slice(0, 10) || "-";
  const endDate = (filters?.end_date || "").toString().slice(0, 10) || "-";
  const generatedAt = new Date();
  const generatedAtStr = `${generatedAt
    .toISOString()
    .slice(0, 10)} ${generatedAt.toTimeString().slice(0, 8)}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Brand Header */}
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
              {phone ? `Phone: ${phone}` : ""}{" "}
              {email ? ` | Email: ${email}` : ""}{" "}
              {website ? ` | Web: ${website}` : ""}
            </Text>
          </View>

          <View style={styles.brandRight}>
            <Text style={styles.rightText}>
              Report: Monthly Purchase Day Counting
            </Text>
            <Text style={styles.rightText}>Generated: {generatedAtStr}</Text>
          </View>
        </View>

        {/* Title + Meta */}
        <Text style={styles.title}>Monthly Purchase Day Counting Report</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            <Text style={styles.metaStrong}>Period: </Text>
            {startDate} to {endDate}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaStrong}>Days Count: </Text>
            {totals?.totalDays ?? 0}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaStrong}>Grand Total: </Text>
            {totals?.totalPurchase ?? 0} BDT
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.slCol]}>
              <Text style={[styles.tableCellHeader, styles.centerText]}>
                SL
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.dateCol]}>
              <Text style={styles.tableCellHeader}>Transaction Date</Text>
            </View>
            <View style={[styles.tableColHeader, styles.voucherCol]}>
              <Text style={styles.tableCellHeader}>Voucher Number</Text>
            </View>
            <View style={[styles.tableColHeader, styles.vendorCol]}>
              <Text style={styles.tableCellHeader}>Vendor Name</Text>
            </View>
            <View style={[styles.tableColHeader, styles.productCol]}>
              <Text style={styles.tableCellHeader}>Product Name</Text>
            </View>
            <View style={[styles.tableColHeader, styles.imeiCol]}>
              <Text style={styles.tableCellHeader}>IMEI</Text>
            </View>
            <View style={[styles.tableColHeader, styles.purchaseCol]}>
              <Text style={[styles.tableCellHeader, styles.rightAlign]}>
                Purchase Amount
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          {(data || []).map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={[styles.tableCol, styles.slCol]}>
                <Text style={[styles.tableCell, styles.centerText]}>
                  {item.sl}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.dateCol]}>
                <Text style={styles.tableCell}>{item.transactionDate}</Text>
              </View>
              <View style={[styles.tableCol, styles.voucherCol]}>
                <Text style={styles.tableCell}>{item.voucherNumber}</Text>
              </View>
              <View style={[styles.tableCol, styles.vendorCol]}>
                <Text style={styles.tableCell}>{item.vendorName}</Text>
              </View>
              <View style={[styles.tableCol, styles.productCol]}>
                <Text style={styles.tableCell}>{item.productName}</Text>
              </View>
              <View style={[styles.tableCol, styles.imeiCol]}>
                <Text style={styles.tableCell}>{item.imei ?? "N/A"}</Text>
              </View>
              <View style={[styles.tableCol, styles.purchaseCol]}>
                <Text style={[styles.tableCell, styles.rightAlign]}>
                  {item.purchaseAmount} BDT
                </Text>
              </View>
            </View>
          ))}

          {/* Summary Row */}
          <View style={[styles.tableRow, styles.summaryRow]}>
            <View style={[styles.tableCol, styles.slCol]}>
              <Text style={[styles.tableCell, styles.centerText]}>
                {totals?.totalDays ?? 0} Days
              </Text>
            </View>
            <View style={[styles.tableCol, styles.dateCol]}>
              <Text style={styles.tableCell}>Grand Total</Text>
            </View>
            <View style={[styles.tableCol, styles.voucherCol]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, styles.vendorCol]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, styles.productCol]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, styles.imeiCol]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, styles.purchaseCol]}>
              <Text style={[styles.tableCell, styles.rightAlign]}>
                {totals?.totalPurchase ?? 0} BDT
              </Text>
            </View>
          </View>
        </View>

        {/* Footer / Signatures */}
        <View style={styles.footer}>
          <View style={styles.signBlock}>
            {signUrl ? <Image src={signUrl} style={styles.signImage} /> : null}
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Authorized Signature</Text>
            {signName ? <Text style={styles.signName}>{signName}</Text> : null}
          </View>

          <View style={styles.signBlock}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Received By</Text>
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

export default MonthlyPurchaseDayCountingReportPDF;
