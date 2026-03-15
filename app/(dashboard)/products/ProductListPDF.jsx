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
  page: { padding: 16, backgroundColor: "#fff" },

  /* ==== Header styles (copied from other PDFs) ==== */
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

  /* ==== Title & table styles ==== */
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
  row: { flexDirection: "row" },
  cellHeader: {
    backgroundColor: "#f3f4f6",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    fontSize: 8,
  },
  textRight: { textAlign: "right" },
  textCenter: { textAlign: "center" },
  footer: {
    position: "absolute",
    bottom: 10,
    right: 16,
    fontSize: 8,
    color: "#6b7280",
  },
});

/* ==== Header component like other reports ==== */
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
        {address ? <Text style={styles.address}>{address}</Text> : null}
        <Text style={styles.contactRow}>
          {phone ? `Phone: ${phone}` : ""} {email ? `| Email: ${email}` : ""}{" "}
          {website ? `| Web: ${website}` : ""}
        </Text>
      </View>
      <View style={styles.brandRight}>
        <Text style={styles.rightText}>Report: Products List</Text>
        <Text style={styles.rightText}>Currency: BDT</Text>
        <Text style={styles.rightText}>Generated: {genStr}</Text>
      </View>
    </View>
  );
}

/* ==== Main PDF ==== */
export default function ProductListPDF({ data = [], user, logoUrlForPdf }) {
  const totalPurchase = data.reduce(
    (sum, p) => sum + (Number(p.purchase_price) || 0),
    0
  );
  const totalRetail = data.reduce(
    (sum, p) => sum + (Number(p.retails_price) || 0),
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branded header */}
        <Header user={user} logoUrlForPdf={logoUrlForPdf} />

        <Text style={styles.title}>Products List Report</Text>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cellHeader, { width: "5%" }]}>SL</Text>
            <Text style={[styles.cellHeader, { width: "30%" }]}>Name</Text>
            <Text style={[styles.cellHeader, { width: "13%" }]}>Purchase</Text>
            <Text style={[styles.cellHeader, { width: "13%" }]}>Retail</Text>
            <Text style={[styles.cellHeader, { width: "13%" }]}>Category</Text>
            <Text style={[styles.cellHeader, { width: "13%" }]}>Sub Category</Text>
            <Text style={[styles.cellHeader, { width: "13%" }]}>Stock</Text>
          </View>

          {data.map((p, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "5%", textAlign: "center" }]}>
                {i + 1}
              </Text>
              <Text style={[styles.cell, { width: "30%" }]}>{p.name}</Text>
              <Text style={[styles.cell, styles.textRight, { width: "13%" }]}>
                {Number(p.purchase_price || 0).toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.cell, styles.textRight, { width: "13%" }]}>
                {Number(p.retails_price || 0).toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.cell, { width: "13%" }]}>
                {p.category?.name || "-"}
              </Text>
              <Text style={[styles.cell, { width: "13%" }]}>
                {p.sub_category?.name || "-"}
              </Text>
              <Text style={[styles.cell, styles.textRight, { width: "13%" }]}>
                {Number(p.current_stock || 0)}
              </Text>
            </View>
          ))}

          {/* Totals */}
          <View style={[styles.row, { backgroundColor: "#f3f4f6" }]}>
            <Text style={[styles.cell, { width: "5%" }]}></Text>
            <Text
              style={[
                styles.cell,
                { width: "30%", fontWeight: "bold", textAlign: "right" },
              ]}
            >
              Total
            </Text>
            <Text
              style={[
                styles.cell,
                styles.textRight,
                { width: "13%", fontWeight: "bold" },
              ]}
            >
              {totalPurchase.toLocaleString("en-IN")}
            </Text>
            <Text
              style={[
                styles.cell,
                styles.textRight,
                { width: "13%", fontWeight: "bold" },
              ]}
            >
              {totalRetail.toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.cell, { width: "13%" }]}></Text>
            <Text style={[styles.cell, { width: "13%" }]}></Text>
            <Text style={[styles.cell, { width: "13%" }]}></Text>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
