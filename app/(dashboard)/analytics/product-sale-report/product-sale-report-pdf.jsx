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

// No hyphenation; keep amounts intact
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header left-right
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

  // Column widths for portrait; amounts widened to prevent breaks (sum 100)
  dateCol: { width: "10%" },
  productCol: { width: "33%" }, // includes image + name + sku
  qtyCol: { width: "7%" },
  priceCol: { width: "9%" },
  costCol: { width: "9%" },
  saleCol: { width: "11%" },
  profitCol: { width: "10%" },
  invoiceCol: { width: "11%" },

  // Thumbnails
  prodWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  thumb: {
    width: 18,
    height: 18,
    objectFit: "cover",
    marginRight: 4,
    borderRadius: 2,
  },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Header({ user, filters }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const logo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || u?.contact_number || "";
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
          <Text style={styles.rightLine}>Report: Product Sales</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Product Sale Report</Text>
    </>
  );
}

export default function ProductSaleReportPDF({
  rows = [],
  totals = { soldQty: 0, soldAmount: 0, purchaseAmount: 0, profit: 0 },
  apiTotals = {
    totalProduct: 0,
    totalSold: 0,
    totalSoldAmount: 0,
    totalPurchaseAmount: 0,
    apiProfit: 0,
  },
  filters,
  user,
}) {
  return (
    <Document>
      {/* Portrait */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.dateCol]}>
              <Text style={styles.head}>Date</Text>
            </View>
            <View style={[styles.th, styles.productCol]}>
              <Text style={styles.head}>Product</Text>
            </View>
            <View style={[styles.th, styles.qtyCol]}>
              <Text style={[styles.head, styles.right]}>Qty</Text>
            </View>
            <View style={[styles.th, styles.priceCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Unit Price
              </Text>
            </View>
            <View style={[styles.th, styles.costCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Unit Cost
              </Text>
            </View>
            <View style={[styles.th, styles.saleCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Sales Amount
              </Text>
            </View>
            <View style={[styles.th, styles.profitCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Profit
              </Text>
            </View>
            <View style={[styles.th, styles.invoiceCol]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.dateCol]}>
                <Text style={styles.cell}>{r.date}</Text>
              </View>
              <View style={[styles.td, styles.productCol]}>
                <View style={styles.prodWrap}>
                  {r.imageData ? (
                    <Image src={r.imageData} style={styles.thumb} />
                  ) : r.imageUrl ? (
                    // Fallback to remote URL if data URI not available
                    <Image
                      src={{ uri: r.imageUrl, method: "GET" }}
                      style={styles.thumb}
                    />
                  ) : (
                    <View
                      style={[styles.thumb, { backgroundColor: "#E5E7EB" }]}
                    />
                  )}
                  <View>
                    <Text style={styles.cell}>{r.productName}</Text>
                    {!!r.sku && (
                      <Text
                        style={[
                          styles.cell,
                          { fontSize: 6.5, color: "#6B7280" },
                        ]}
                      >
                        {r.sku}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={[styles.td, styles.qtyCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.qty)}
                </Text>
              </View>
              <View style={[styles.td, styles.priceCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.unitSale)}
                </Text>
              </View>
              <View style={[styles.td, styles.costCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.unitCost)}
                </Text>
              </View>
              <View style={[styles.td, styles.saleCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.saleAmount)}
                </Text>
              </View>
              <View style={[styles.td, styles.profitCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.profit)}
                </Text>
              </View>
              <View style={[styles.td, styles.invoiceCol]}>
                <Text style={styles.cell}>{r.invoiceId.split("-").pop()}</Text>
              </View>
            </View>
          ))}

          {/* Totals (view) */}
          <View style={styles.row}>
            <View style={[styles.td, styles.dateCol]} />
            <View style={[styles.td, styles.productCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Totals</Text>
              <Text style={[styles.cell, { fontSize: 6.5, color: "#6B7280" }]}>
                Products {apiTotals.totalProduct} | Qty {apiTotals.totalSold} |
                Sold {fmt2(apiTotals.totalSoldAmount)} | Profit{" "}
                {fmt2(apiTotals.apiProfit)}
              </Text>
            </View>
            <View style={[styles.td, styles.qtyCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals.soldQty)}
              </Text>
            </View>
            <View style={[styles.td, styles.priceCol]} />
            <View style={[styles.td, styles.costCol]} />
            <View style={[styles.td, styles.saleCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals.soldAmount)}
              </Text>
            </View>
            <View style={[styles.td, styles.profitCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals.profit)}
              </Text>
            </View>
            <View style={[styles.td, styles.invoiceCol]} />
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
