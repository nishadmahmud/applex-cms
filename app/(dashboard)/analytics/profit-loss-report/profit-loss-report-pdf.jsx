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

// Prevent hyphenation; keep amounts in one line
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

  // Two-column table (4 cols)
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

  // Column widths (sum 100); amounts widened to avoid wrapping
  leftLabel: { width: "44%" },
  leftAmt: { width: "16%" },
  rightLabel: { width: "26%" },
  rightAmt: { width: "14%" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

const fmt = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

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
          <Text style={styles.rightLine}>Report: Profit & Loss</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {startDate || "-"} to {endDate || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Profit and Loss Account</Text>
    </>
  );
}

export default function ProfitLossReportPDF({
  leftRows = [],
  rightRows = [],
  totals = { left: 0, right: 0 },
  filters,
  user,
}) {
  const maxRows = Math.max(leftRows.length, rightRows.length);

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.leftLabel]}>
              <Text style={styles.head}>Particulars</Text>
            </View>
            <View style={[styles.th, styles.leftAmt]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (In BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.rightLabel]}>
              <Text style={styles.head}>Particulars</Text>
            </View>
            <View style={[styles.th, styles.rightAmt]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount (In BDT)
              </Text>
            </View>
          </View>

          {/* Rows */}
          {Array.from({ length: maxRows }).map((_, i) => {
            const L = leftRows[i];
            const R = rightRows[i];
            return (
              <View style={styles.row} key={`r-${i}`}>
                <View style={[styles.td, styles.leftLabel]}>
                  <Text style={styles.cell}>{L?.label ?? ""}</Text>
                </View>
                <View style={[styles.td, styles.leftAmt]}>
                  <Text style={[styles.cell, styles.right]} wrap={false}>
                    {L ? fmt(L.amount) : ""}
                  </Text>
                </View>

                <View style={[styles.td, styles.rightLabel]}>
                  <Text style={styles.cell}>{R?.label ?? ""}</Text>
                </View>
                <View style={[styles.td, styles.rightAmt]}>
                  <Text style={[styles.cell, styles.right]} wrap={false}>
                    {R ? fmt(R.amount) : ""}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.leftLabel]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Total Expenses (In BDT):
              </Text>
            </View>
            <View style={[styles.td, styles.leftAmt]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt(totals?.left ?? 0)}
              </Text>
            </View>
            <View style={[styles.td, styles.rightLabel]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Total (In BDT):
              </Text>
            </View>
            <View style={[styles.td, styles.rightAmt]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt(totals?.right ?? 0)}
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
