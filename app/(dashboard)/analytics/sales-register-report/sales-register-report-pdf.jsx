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

// Keep words intact and prevent hyphenation
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header: left shop info, right meta
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
  center: { textAlign: "center" },
  right: { textAlign: "right" },

  // Column widths (sum 100) tuned to avoid wrapping of amounts
  dateCol: { width: "18%" },
  imeiCol: { width: "12%" },
  normalCol: { width: "12%" },
  giftCol: { width: "10%" },
  giftAmtCol: { width: "18%" },
  salesAmtCol: { width: "30%" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

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
  const startDate = (filters?.start_date || "").toString().slice(0, 10);
  const endDate = (filters?.end_date || "").toString().slice(0, 10);

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
          <Text style={styles.rightLine}>Report: Sales Register</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {startDate || "-"} to {endDate || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Sales Register Report</Text>
    </>
  );
}

export default function SalesRegisterReportPDF({
  rows = [],
  totals,
  filters,
  user,
}) {
  return (
    <Document>
      {/* PORTRAIT */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.dateCol]}>
              <Text style={styles.head}>Date</Text>
            </View>
            <View style={[styles.th, styles.imeiCol]}>
              <Text style={[styles.head, styles.right]}>SL/IMEI</Text>
              <Text style={[styles.head, styles.right]}>(qty)</Text>
            </View>
            <View style={[styles.th, styles.normalCol]}>
              <Text style={[styles.head, styles.right]}>Normal</Text>
              <Text style={[styles.head, styles.right]}>(qty)</Text>
            </View>
            <View style={[styles.th, styles.giftCol]}>
              <Text style={[styles.head, styles.right]}>Gift</Text>
              <Text style={[styles.head, styles.right]}>(qty)</Text>
            </View>
            <View style={[styles.th, styles.giftAmtCol]}>
              <Text style={[styles.head, styles.right]}>Gift Amount</Text>
              <Text style={[styles.head, styles.right]}>(In BDT)</Text>
            </View>
            <View style={[styles.th, styles.salesAmtCol]}>
              <Text style={[styles.head, styles.right]}>Sales Amount</Text>
              <Text style={[styles.head, styles.right]}>(In BDT)</Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={r.date + i}>
              <View style={[styles.td, styles.dateCol]}>
                <Text style={styles.cell}>{r.date}</Text>
              </View>
              <View style={[styles.td, styles.imeiCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.sl_imei)}
                </Text>
              </View>
              <View style={[styles.td, styles.normalCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.normal)}
                </Text>
              </View>
              <View style={[styles.td, styles.giftCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.gift)}
                </Text>
              </View>
              <View style={[styles.td, styles.giftAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.gift_amount)}
                </Text>
              </View>
              <View style={[styles.td, styles.salesAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r.sales_amount)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.dateCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Total Discount
              </Text>
            </View>
            {/* span middle as empties */}
            <View style={[styles.td, styles.imeiCol]} />
            <View style={[styles.td, styles.normalCol]} />
            <View style={[styles.td, styles.giftCol]} />
            <View style={[styles.td, styles.giftAmtCol]} />
            <View style={[styles.td, styles.salesAmtCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals?.totalDiscount ?? 0)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.td, styles.dateCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Grand Total
              </Text>
            </View>
            <View style={[styles.td, styles.imeiCol]} />
            <View style={[styles.td, styles.normalCol]} />
            <View style={[styles.td, styles.giftCol]} />
            <View style={[styles.td, styles.giftAmtCol]} />
            <View style={[styles.td, styles.salesAmtCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals?.totalSales ?? 0)}
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
