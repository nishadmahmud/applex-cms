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

// Keep text intact (no hyphenation)
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

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
    backgroundColor: "#EEF2FF",
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
  muted: { color: "#6B7280", fontSize: 6.5 },

  // Column widths (sum 100); widen amount to avoid wrapping
  dateCol: { width: "17%" },
  acCol: { width: "22%" },
  catCol: { width: "12%" },
  typeCol: { width: "12%" },
  refCol: { width: "20%" },
  nameCol: { width: "9%" },
  amtCol: { width: "8%" },

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
  const start = (filters?.from_date || "").toString().slice(0, 10);
  const end = (filters?.to_date || "").toString().slice(0, 10);

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
          <Text style={styles.rightLine}>Report: Accounting History</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Accounting History</Text>
    </>
  );
}

export default function AccountingHistoryPDF({
  rows = [],
  totals,
  filters,
  user,
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.dateCol]}>
              <Text style={styles.head}>Date/Time</Text>
            </View>
            <View style={[styles.th, styles.acCol]}>
              <Text style={styles.head}>AC/Number</Text>
            </View>
            <View style={[styles.th, styles.catCol]}>
              <Text style={styles.head}>Transaction Category</Text>
            </View>
            <View style={[styles.th, styles.typeCol]}>
              <Text style={styles.head}>Transaction Type</Text>
            </View>
            <View style={[styles.th, styles.refCol]}>
              <Text style={styles.head}>Ref ID</Text>
            </View>
            <View style={[styles.th, styles.nameCol]}>
              <Text style={styles.head}>Name</Text>
            </View>
            <View style={[styles.th, styles.amtCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Amount
              </Text>
            </View>
          </View>

          {/* Rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.dateCol]}>
                <Text style={styles.cell}>{r.prettyDate}</Text>
                <Text style={[styles.cell, styles.muted]}>{r.relative}</Text>
              </View>
              <View style={[styles.td, styles.acCol]}>
                <Text style={[styles.cell, { fontWeight: "bold" }]}>
                  {r.paymentType || "-"}
                </Text>
                <Text style={styles.cell}>{r.paymentCategory || "-"}</Text>
                <Text style={styles.cell}>{r.accountNumber || "-"}</Text>
              </View>
              <View style={[styles.td, styles.catCol]}>
                <Text style={styles.cell}>{r.transCategory}</Text>
              </View>
              <View style={[styles.td, styles.typeCol]}>
                <Text style={styles.cell}>{r.transType}</Text>
              </View>
              <View style={[styles.td, styles.refCol]}>
                <Text style={styles.cell}>{r.refId}</Text>
              </View>
              <View style={[styles.td, styles.nameCol]}>
                <Text style={styles.cell}>{r.transName}</Text>
              </View>
              <View style={[styles.td, styles.amtCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.amount)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.row}>
            <View style={[styles.td, styles.dateCol]} />
            <View style={[styles.td, styles.acCol]} />
            <View style={[styles.td, styles.catCol]} />
            <View style={[styles.td, styles.typeCol]} />
            <View style={[styles.td, styles.refCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>Total</Text>
            </View>
            <View style={[styles.td, styles.nameCol]} />
            <View style={[styles.td, styles.amtCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals?.viewTotal ?? 0)}
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
