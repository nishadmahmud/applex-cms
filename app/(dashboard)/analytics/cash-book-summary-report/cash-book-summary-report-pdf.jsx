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

// Keep words and numbers intact
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
    backgroundColor: "#E8F5C8",
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

  // Column widths (sum 100)
  serialCol: { width: "8%" },
  dateCol: { width: "18%" },
  particularsCol: { width: "32%" },
  typeCol: { width: "18%" },
  debitCol: { width: "12%" },
  creditCol: { width: "12%" },

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

function Header({ user, filters, payTypeName }) {
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
          <Text style={styles.rightLine}>Report: Cash Book Summary</Text>
          <Text style={styles.rightLine}>Currency: BDT</Text>
          <Text style={styles.rightLine}>
            Period: {start || "-"} to {end || "-"}
          </Text>
          <Text style={styles.rightLine}>
            Payment Type: {payTypeName || "All"}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Cash Book Summary Report</Text>
    </>
  );
}

export default function CashBookSummaryReportPDF({
  rows = [],
  opening = 0,
  totals = { debit: 0, credit: 0, closing: 0 },
  filters,
  user,
  payTypeName = "All",
}) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Header user={user} filters={filters} payTypeName={payTypeName} />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <View style={[styles.th, styles.serialCol]}>
              <Text style={styles.head}>Serial No</Text>
            </View>
            <View style={[styles.th, styles.dateCol]}>
              <Text style={styles.head}>Transaction Date</Text>
            </View>
            <View style={[styles.th, styles.particularsCol]}>
              <Text style={styles.head}>Particulars</Text>
            </View>
            <View style={[styles.th, styles.typeCol]}>
              <Text style={styles.head}>Vch Types</Text>
            </View>
            <View style={[styles.th, styles.debitCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Debit (in BDT)
              </Text>
            </View>
            <View style={[styles.th, styles.creditCol]}>
              <Text style={[styles.head, styles.right]} wrap={false}>
                Credit (in BDT)
              </Text>
            </View>
          </View>

          {/* Opening Balance */}
          <View style={styles.row}>
            <View style={[styles.td, styles.serialCol]}>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.td, styles.dateCol]}>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.td, styles.particularsCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Opening Balance
              </Text>
            </View>
            <View style={[styles.td, styles.typeCol]}>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.td, styles.debitCol]}>
              <Text style={[styles.cell, styles.right]}>0.00</Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(opening)}
              </Text>
            </View>
          </View>

          {/* Data rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, styles.serialCol]}>
                <Text style={styles.cell}>{i + 1}</Text>
              </View>
              <View style={[styles.td, styles.dateCol]}>
                <Text style={styles.cell}>{r.date}</Text>
              </View>
              <View style={[styles.td, styles.particularsCol]}>
                <Text style={styles.cell}>{r.particulars || "-"}</Text>
              </View>
              <View style={[styles.td, styles.typeCol]}>
                <Text style={styles.cell}>{r.vchType}</Text>
              </View>
              <View style={[styles.td, styles.debitCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.debit)}
                </Text>
              </View>
              <View style={[styles.td, styles.creditCol]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.credit)}
                </Text>
              </View>
            </View>
          ))}

          {/* Current Total */}
          <View style={styles.row}>
            <View style={[styles.td, styles.serialCol]} />
            <View style={[styles.td, styles.dateCol]} />
            <View style={[styles.td, styles.particularsCol]}>
              <Text style={[styles.cell, { fontWeight: "bold" }]}>
                Current Total
              </Text>
            </View>
            <View style={[styles.td, styles.typeCol]} />
            <View style={[styles.td, styles.debitCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals.debit)}
              </Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text
                style={[styles.cell, styles.right, { fontWeight: "bold" }]}
                wrap={false}
              >
                {fmt2(totals.credit)}
              </Text>
            </View>
          </View>

          {/* Closing Balance */}
          <View style={styles.row}>
            <View style={[styles.td, styles.serialCol]} />
            <View style={[styles.td, styles.dateCol]} />
            <View style={[styles.td, styles.particularsCol]}>
              <Text
                style={[
                  styles.cell,
                  { color: "#2563eb", textDecoration: "underline" },
                ]}
              >
                Closing Balance
              </Text>
            </View>
            <View style={[styles.td, styles.typeCol]} />
            <View style={[styles.td, styles.debitCol]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
            <View style={[styles.td, styles.creditCol]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(totals.closing)}
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
