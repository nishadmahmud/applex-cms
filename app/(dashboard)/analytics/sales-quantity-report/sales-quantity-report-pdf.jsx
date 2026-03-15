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

// Prevent hyphenation, keep numbers intact
Font.registerHyphenationCallback((word) => [word]);

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

  // Column widths (sum 100) tuned for portrait
  productCol: { width: "50%" },
  priceCol: { width: "15%" },
  qtyCol: { width: "12%" },
  amountCol: { width: "23%" },

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

function Header({ user, apiUserInfo, filters }) {
  // Prefer session user/invoice settings; fall back to API's user_info if needed
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name ||
    u?.outlet_name ||
    apiUserInfo?.outlet_name ||
    "Outlet / Company";
  const logo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || apiUserInfo?.address || "";
  const phone = inv?.mobile_number || u?.phone || apiUserInfo?.phone || "";
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
          <Text style={styles.rightLine}>Report: Sales Quantity</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Sales Quantity Report</Text>
    </>
  );
}

export default function SalesQuantityReportPDF({
  rows = [],
  totals = { viewQty: 0, viewAmount: 0, apiQty: 0, apiAmount: 0 },
  filters,
  user,
  apiUserInfo,
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} apiUserInfo={apiUserInfo} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.productCol]}>
              <Text style={styles.head}>Product</Text>
            </View>
            <View style={[styles.th, styles.priceCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Price
              </Text>
            </View>
            <View style={[styles.th, styles.qtyCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Quantity
              </Text>
            </View>
            <View style={[styles.th, styles.amountCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Sales Amount (BDT)
              </Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.productCol]}>
                <Text style={styles.cell}>{r.productName}</Text>
              </View>
              <View style={[styles.td, styles.priceCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.price)}
                </Text>
              </View>
              <View style={[styles.td, styles.qtyCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.qty)}
                </Text>
              </View>
              <View style={[styles.td, styles.amountCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.amount)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.productCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Grand Total Quantity
              </Text>
            </View>
            <View style={[styles.td, styles.priceCol]} />
            <View style={[styles.td, styles.qtyCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt0(totals.viewQty)}
              </Text>
            </View>
            <View style={[styles.td, styles.amountCol]} />
          </View>

          <View style={styles.row}>
            <View style={[styles.td, styles.productCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Grand Total Sales
              </Text>
            </View>
            <View style={[styles.td, styles.priceCol]} />
            <View style={[styles.td, styles.qtyCol]} />
            <View style={[styles.td, styles.amountCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt0(totals.viewAmount)}
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
