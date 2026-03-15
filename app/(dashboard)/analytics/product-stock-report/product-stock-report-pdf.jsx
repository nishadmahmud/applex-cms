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

// Prevent hyphenation/splitting
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
  //   rightText: { textAlign: "right" },

  // Column widths (sum 100)
  slCol: { width: "6%" },
  productCol: { width: "52%" },
  currentCol: { width: "14%" },
  purchaseCol: { width: "14%" },
  totalCol: { width: "14%" },

  // Footer
  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function Header({ user, startDate, endDate, totalValue, logoUrlForPdf }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const shopLogo = logoUrlForPdf || inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || u?.contact_number || "";
  const email = inv?.email || u?.email || "";
  const website = inv?.web_address || u?.web_address || "";
  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;

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
            Report: Product Stock
          </Text>
          <Text style={styles.rightText} wrap={false}>
            Currency: BDT
          </Text>
          <Text style={styles.rightText} wrap={false}>
            Generated: {genStr}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Product Stock Report</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaItem}>
          <Text style={styles.metaStrong}>Period: </Text>
          {startDate || "-"} to {endDate || "-"}
        </Text>
        <Text style={styles.metaItem}>
          <Text style={styles.metaStrong}>Total Inventory Value (BDT): </Text>
          {Number(totalValue || 0).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </>
  );
}

function ProductStockReportPDF({
  data = [],
  totals,
  filters,
  user,
  logoUrlForPdf,
}) {
  const startDate = (filters?.start_date || "").toString().slice(0, 10);
  const endDate = (filters?.end_date || "").toString().slice(0, 10);

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header
          user={user}
          startDate={startDate}
          endDate={endDate}
          totalValue={totals?.totalInventoryValue ?? 0}
          logoUrlForPdf={logoUrlForPdf}
        />

        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, styles.slCol]}>
              <Text style={[styles.tableCellHeader, styles.centerText]}>
                SL
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.productCol]}>
              <Text style={styles.tableCellHeader}>Product Name</Text>
            </View>
            <View style={[styles.tableColHeader, styles.currentCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Current Stock
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.purchaseCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Purchase Price
              </Text>
            </View>
            <View style={[styles.tableColHeader, styles.totalCol]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Total Price
              </Text>
            </View>
          </View>

          {/* Rows */}
          {data.map((r, idx) => (
            <View style={styles.tableRow} key={idx}>
              <View style={[styles.tableCol, styles.slCol]}>
                <Text style={[styles.tableCell, styles.centerText]}>
                  {r.sl}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.productCol]}>
                <Text style={styles.tableCell}>{r.productName}</Text>
              </View>
              <View style={[styles.tableCol, styles.currentCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmt(r.currentStock)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.purchaseCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmt(r.purchasePrice)}
                </Text>
              </View>
              <View style={[styles.tableCol, styles.totalCol]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {fmt(r.totalPrice)}
                </Text>
              </View>
            </View>
          ))}

          {/* Summary row */}
          <View style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}>
            <View style={[styles.tableCol, styles.slCol]}>
              <Text style={[styles.tableCell, styles.centerText]}>—</Text>
            </View>
            <View style={[styles.tableCol, styles.productCol]}>
              <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                Total
              </Text>
            </View>
            <View style={[styles.tableCol, styles.currentCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmt(data.reduce((sum, r) => sum + (r.currentStock || 0), 0))}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.purchaseCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmt(data.reduce((sum, r) => sum + (r.purchasePrice || 0), 0))}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.totalCol]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {fmt(data.reduce((sum, r) => sum + (r.totalPrice || 0), 0))}
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

export default ProductStockReportPDF;
