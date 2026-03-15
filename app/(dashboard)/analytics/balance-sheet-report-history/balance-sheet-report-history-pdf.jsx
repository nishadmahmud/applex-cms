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

// Keep words intact (no hyphenation)
Font.registerHyphenationCallback((word) => [word]);

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

  // Table (4 columns only)
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
  bold: { fontWeight: "bold" },

  // Widen amount columns to prevent wrapping (sum 100)
  // Amount columns are 18% each; labels are 32% each
  liabLabel: { width: "32%" },
  liabAmt: { width: "18%" },
  assetLabel: { width: "32%" },
  assetAmt: { width: "18%" },

  // Amount text: slightly tighter leading; no wrapping
  amountText: { fontSize: 7, lineHeight: 1.05, textAlign: "right" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });

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
          <Text style={styles.rightLine}>Report: Balance Sheet</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {startDate || "-"} to {endDate || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Balance Sheet Report History</Text>
    </>
  );
}

export default function BalanceSheetReportHistoryPDF({ filters, user, data }) {
  const {
    assetsRows = [],
    liabilitiesRows = [],
    assetsTotal = 0,
    liabilitiesTotal = 0,
  } = data || {};

  const maxRows = Math.max(assetsRows.length, liabilitiesRows.length);

  return (
    <Document>
      {/* PORTRAIT */}
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.liabLabel]}>
              <Text style={styles.head} wrap={false}>
                Liabilities & Equity
              </Text>
            </View>
            <View style={[styles.th, styles.liabAmt]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (In BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.assetLabel]}>
              <Text style={styles.head} wrap={false}>
                Assets
              </Text>
            </View>
            <View style={[styles.th, styles.assetAmt]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (In BDT)
              </Text>
            </View>
          </View>

          {/* Rows */}
          {Array.from({ length: maxRows }).map((_, i) => {
            const L = liabilitiesRows[i];
            const A = assetsRows[i];
            return (
              <View style={styles.row} key={`r-${i}`}>
                {/* Left */}
                <View style={[styles.td, styles.liabLabel]}>
                  <Text style={[styles.cell, L?.isGroup ? styles.bold : null]}>
                    {L ? L.label : ""}
                  </Text>
                </View>
                <View style={[styles.td, styles.liabAmt]}>
                  <Text style={[styles.cell, styles.amountText]} wrap={false}>
                    {L && !L.isGroup ? fmt(L.amount) : ""}
                  </Text>
                </View>

                {/* Right */}
                <View style={[styles.td, styles.assetLabel]}>
                  <Text style={[styles.cell, A?.isGroup ? styles.bold : null]}>
                    {A ? A.label : ""}
                  </Text>
                </View>
                <View style={[styles.td, styles.assetAmt]}>
                  <Text style={[styles.cell, styles.amountText]} wrap={false}>
                    {A && !A.isGroup ? fmt(A.amount) : ""}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.liabLabel]}>
              <Text style={[styles.cell, styles.bold]}>Total:</Text>
            </View>
            <View style={[styles.td, styles.liabAmt]}>
              <Text
                style={[styles.cell, styles.amountText, styles.bold]}
                wrap={false}
              >
                {fmt(liabilitiesTotal)}
              </Text>
            </View>

            <View style={[styles.td, styles.assetLabel]}>
              <Text style={[styles.cell, styles.bold]}>Total:</Text>
            </View>
            <View style={[styles.td, styles.assetAmt]}>
              <Text
                style={[styles.cell, styles.amountText, styles.bold]}
                wrap={false}
              >
                {fmt(assetsTotal)}
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
