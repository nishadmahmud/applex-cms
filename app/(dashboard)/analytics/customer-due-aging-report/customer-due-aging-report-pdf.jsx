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

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header (left shop, right meta)
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
  center: { textAlign: "center" },

  // Column widths (sum 100)
  snCol: { width: "6%" },
  customerCol: { width: "22%" },
  lsDateCol: { width: "12%" },
  lsAmtCol: { width: "12%" },
  sDaysCol: { width: "6%" },
  lrDateCol: { width: "12%" },
  lrAmtCol: { width: "12%" },
  rDaysCol: { width: "6%" },
  dueCol: { width: "12%" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function Header({ user, filters, customerLabel, logoUrl }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";

  // Logo now comes only from the precomputed, same-origin URL
  const logo = logoUrl || null;

  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
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
          <Text style={styles.rightLine}>Report: Customer Due Aging</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>Customer: {customerLabel || "-"}</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Customer Due with Aging</Text>
    </>
  );
}

export default function CustomerDueAgingReportPDF({
  rows = [],
  totals = { totalSales: 0, totalReceipt: 0, totalDue: 0 },
  filters,
  user,
  customerLabel = "",
  logoUrl,
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header
          user={user}
          filters={filters}
          customerLabel={customerLabel}
          logoUrl={logoUrl}
        />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.snCol]}>
              <Text style={[styles.head, styles.center]}>SN</Text>
            </View>
            <View style={[styles.th, styles.customerCol]}>
              <Text style={styles.head}>Customer</Text>
            </View>
            <View style={[styles.th, styles.lsDateCol]}>
              <Text style={styles.head}>Last Sales Date</Text>
            </View>
            <View style={[styles.th, styles.lsAmtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Last Sales Amount (BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.sDaysCol]}>
              <Text style={[styles.head, styles.center]} wrap={false}>
                Days
              </Text>
            </View>
            <View style={[styles.th, styles.lrDateCol]}>
              <Text style={styles.head}>Last Receipt Date</Text>
            </View>
            <View style={[styles.th, styles.lrAmtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Last Receipt Amount (BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.rDaysCol]}>
              <Text style={[styles.head, styles.center]} wrap={false}>
                Days
              </Text>
            </View>
            <View style={[styles.th, styles.dueCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Current Due (BDT)
              </Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.snCol]}>
                <Text style={[styles.cell, styles.center]}>{i + 1}</Text>
              </View>
              <View style={[styles.td, styles.customerCol]}>
                <Text style={styles.cell}>{r?.name || "-"}</Text>
              </View>
              <View style={[styles.td, styles.lsDateCol]}>
                <Text style={styles.cell}>
                  {r?.last_sales_date
                    ? String(r.last_sales_date).slice(0, 10)
                    : "-"}
                </Text>
              </View>
              <View style={[styles.td, styles.lsAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.last_sales_amount)}
                </Text>
              </View>
              <View style={[styles.td, styles.sDaysCol]}>
                <Text style={[styles.cell, styles.center]} wrap={false}>
                  {r?.sales_days ?? "-"}
                </Text>
              </View>
              <View style={[styles.td, styles.lrDateCol]}>
                <Text style={styles.cell}>
                  {r?.last_receipt_date
                    ? String(r.last_receipt_date).slice(0, 10)
                    : "-"}
                </Text>
              </View>
              <View style={[styles.td, styles.lrAmtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.last_receipt_amount)}
                </Text>
              </View>
              <View style={[styles.td, styles.rDaysCol]}>
                <Text style={[styles.cell, styles.center]} wrap={false}>
                  {r?.receipt_days ?? "-"}
                </Text>
              </View>
              <View style={[styles.td, styles.dueCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt(r?.current_due)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.snCol]}>
              <Text
                style={[styles.cell, { fontWeight: "bold" }, styles.center]}
              >
                Totals
              </Text>
            </View>
            <View style={[styles.td, styles.customerCol]} />
            <View style={[styles.td, styles.lsDateCol]} />
            <View style={[styles.td, styles.lsAmtCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalSales)}
              </Text>
            </View>
            <View style={[styles.td, styles.sDaysCol]} />
            <View style={[styles.td, styles.lrDateCol]} />
            <View style={[styles.td, styles.lrAmtCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalReceipt)}
              </Text>
            </View>
            <View style={[styles.td, styles.rDaysCol]} />
            <View style={[styles.td, styles.dueCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt(totals.totalDue)}
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
