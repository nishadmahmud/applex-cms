// VendorListPDF.jsx
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
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },
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
  brandRight: { width: 180, alignItems: "flex-end" },
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

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: { flexDirection: "row" },
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
  tableCellHeader: { fontSize: 8, fontWeight: "bold" },
  tableCell: { fontSize: 7 },
  centerText: { textAlign: "center" },
  //   rightText: { textAlign: "right" },
  footer: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function Header({ user, logoUrlForPdf }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const shopLogo = logoUrlForPdf || inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
  const email = inv?.email || u?.email || "";
  const website = inv?.web_address || u?.web_address || "";

  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;

  return (
    <View style={styles.brandHeader}>
      <View style={styles.logoWrap}>
        {shopLogo ? (
          <Image src={shopLogo} style={styles.logo} />
        ) : (
          <Text style={{ fontSize: 10, color: "#9CA3AF" }}>No Logo</Text>
        )}
      </View>
      <View style={styles.brandCenter}>
        <Text style={styles.shopName}>{shopName}</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.contactRow}>
          {phone ? `Phone: ${phone}` : ""} {email ? `| Email: ${email}` : ""}{" "}
          {website ? `| Web: ${website}` : ""}
        </Text>
      </View>
      <View style={styles.brandRight}>
        <Text style={styles.rightText}>Report: Vendor List</Text>
        <Text style={styles.rightText}>Currency: BDT</Text>
        <Text style={styles.rightText}>Generated: {genStr}</Text>
      </View>
    </View>
  );
}

export default function VendorListPDF({ data = [], user, logoUrlForPdf }) {
  const totalAmount = data.reduce(
    (sum, v) => sum + (Number(v.total_purchase_amount) || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header user={user} logoUrlForPdf={logoUrlForPdf} />
        <Text style={styles.title}>Vendor List Report</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "6%" }]}>
              <Text style={[styles.tableCellHeader, styles.centerText]}>
                SL
              </Text>
            </View>
            <View style={[styles.tableColHeader, { width: "25%" }]}>
              <Text style={styles.tableCellHeader}>Name</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "17%" }]}>
              <Text style={styles.tableCellHeader}>Mobile</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "14%" }]}>
              <Text style={styles.tableCellHeader}>Due Amount (BDT)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "13%" }]}>
              <Text style={[styles.tableCellHeader, styles.centerText]}>
                Purchase Count
              </Text>
            </View>
            <View style={[styles.tableColHeader, { width: "25%" }]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Total Purchase (BDT)
              </Text>
            </View>
          </View>

          {data.map((v, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={[styles.tableCol, { width: "6%" }]}>
                <Text style={[styles.tableCell, styles.centerText]}>
                  {i + 1}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>{v.name}</Text>
              </View>
              <View style={[styles.tableCol, { width: "17%" }]}>
                <Text style={styles.tableCell}>{v.mobile_number || "-"}</Text>
              </View>
              <View style={[styles.tableCol, { width: "14%" }]}>
                <Text style={styles.tableCell}>
                  {Number(v.total_due_amount || 0).toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "13%" }]}>
                <Text style={[styles.tableCell, styles.centerText]}>
                  {v.invoice_list_count}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {Number(v.total_purchase_amount || 0).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View
            style={[
              styles.tableRow,
              { backgroundColor: "#F3F4F6", borderTopWidth: 1 },
            ]}
          >
            <View style={[styles.tableCol, { width: "6%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text
                style={[
                  styles.tableCell,
                  { fontWeight: "bold", textAlign: "right" },
                ]}
              >
                Total
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "17%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "14%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "13%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.rightText,
                  { fontWeight: "bold" },
                ]}
              >
                {totalAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
