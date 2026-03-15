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

const fmt0 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header
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
    backgroundColor: "#C7F48B", // lime header as screenshot
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

  totalRow: { backgroundColor: "#F3F4F6" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

// Column flex weights (sum = 100)
const FLEX = {
  // Particulars (42)
  date: 12,
  ledger: 12,
  ref: 8,
  voucher: 10,
  // Inwards (19)
  inQty: 6,
  inRate: 6,
  inAmt: 7,
  // Outward (19)
  outQty: 6,
  outRate: 6,
  outAmt: 7,
  // Balance (20)
  balQty: 6,
  balRate: 7,
  balAmt: 7,
};

function toDateStr(d) {
  try {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d || "");
  }
}
function toLocalDateTimeStr(d) {
  try {
    const dd = new Date(d);
    if (isNaN(dd)) return "-";
    const date = dd.toISOString().slice(0, 10);
    const time = dd.toTimeString().slice(0, 8);
    return `${date} ${time}`;
  } catch {
    return "-";
  }
}

function Header({ user, productLabel, filters, currency }) {
  const u = user || {};
  const inv = u?.invoice_settings || {};
  const shopName =
    inv?.shop_name || u?.outlet_name || u?.owner_name || "Outlet / Company";
  const logo = inv?.shop_logo || u?.logo;
  const address = inv?.shop_address || u?.address || "";
  const phone = inv?.mobile_number || u?.phone || "";
  const email = inv?.email || u?.email || "";
  const web = inv?.web_address || u?.web_address || "";

  const gen = new Date();
  const genStr = `${gen.toISOString().slice(0, 10)} ${gen
    .toTimeString()
    .slice(0, 8)}`;

  const start = filters?.start_date
    ? toLocalDateTimeStr(filters.start_date)
    : "-";
  const end = filters?.end_date ? toLocalDateTimeStr(filters.end_date) : "-";

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
          <Text style={styles.rightLine}>Report: Store Ledger</Text>
          <Text style={styles.rightLine}>Currency: {currency || "BDT"}</Text>
          <Text style={styles.rightLine}>Product: {productLabel || "-"}</Text>
          <Text style={styles.rightLine}>
            Period: {start} to {end}
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Store Ledger Report</Text>
    </>
  );
}

export default function StoreLedgerReportPDF({
  rows = [],
  totals,
  opening = { qty: 0, rate: 0, amount: 0 },
  closing = { qty: 0, rate: 0, amount: 0 },
  user,
  filters = { start_date: null, end_date: null },
  productLabel = "",
}) {
  const currency =
    user?.invoice_settings?.currency_info?.code ||
    user?.invoice_settings?.currency_info?.name ||
    "BDT";

  // Derive totals if not provided
  const computedTotals = rows.reduce(
    (acc, r) => {
      acc.inQty += Number(r?.inQty || 0);
      acc.inAmount += Number(r?.inAmount || 0);
      acc.outQty += Number(r?.outQty || 0);
      acc.outAmount += Number(r?.outAmount || 0);
      return acc;
    },
    { inQty: 0, inAmount: 0, outQty: 0, outAmount: 0 }
  );
  const t = totals || computedTotals;

  const openQty = Number(opening?.qty || 0);
  const openRate = Number(opening?.rate || 0);
  const openAmount = Number(opening?.amount || 0);

  const closeQty = Number(closing?.qty || 0);
  const closeRate = Number(closing?.rate || 0);
  const closeAmount = Number(closing?.amount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header
          user={user}
          productLabel={productLabel}
          filters={filters}
          currency={currency}
        />

        {/* Group header row */}
        <View style={styles.table}>
          <View style={styles.row}>
            <View
              style={[
                styles.th,
                { flex: FLEX.date + FLEX.ledger + FLEX.ref + FLEX.voucher },
              ]}
            >
              <Text style={[styles.head]}>Particulars</Text>
            </View>
            <View
              style={[
                styles.th,
                { flex: FLEX.inQty + FLEX.inRate + FLEX.inAmt },
              ]}
            >
              <Text
                style={[styles.head, { textAlign: "center", width: "100%" }]}
              >
                Inwards
              </Text>
            </View>
            <View
              style={[
                styles.th,
                { flex: FLEX.outQty + FLEX.outRate + FLEX.outAmt },
              ]}
            >
              <Text
                style={[styles.head, { textAlign: "center", width: "100%" }]}
              >
                Outward
              </Text>
            </View>
            <View
              style={[
                styles.th,
                { flex: FLEX.balQty + FLEX.balRate + FLEX.balAmt },
              ]}
            >
              <Text
                style={[styles.head, { textAlign: "center", width: "100%" }]}
              >
                Balance
              </Text>
            </View>
          </View>

          {/* Column header row */}
          <View style={styles.row}>
            <View style={[styles.th, { flex: FLEX.date }]}>
              <Text style={styles.head}>Date</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.ledger }]}>
              <Text style={styles.head}>Ledger Name</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.ref }]}>
              <Text style={styles.head}>Ref. No.</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.voucher }]}>
              <Text style={styles.head}>Voucher Type</Text>
            </View>

            <View style={[styles.th, { flex: FLEX.inQty }]}>
              <Text style={[styles.head, styles.right]}>Qty</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.inRate }]}>
              <Text style={[styles.head, styles.right]}>Rate</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.inAmt }]}>
              <Text style={[styles.head, styles.right]}>Amount {currency}</Text>
            </View>

            <View style={[styles.th, { flex: FLEX.outQty }]}>
              <Text style={[styles.head, styles.right]}>Qty</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.outRate }]}>
              <Text style={[styles.head, styles.right]}>Rate</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.outAmt }]}>
              <Text style={[styles.head, styles.right]}>Amount {currency}</Text>
            </View>

            <View style={[styles.th, { flex: FLEX.balQty }]}>
              <Text style={[styles.head, styles.right]}>Qty</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.balRate }]}>
              <Text style={[styles.head, styles.right]}>Rate</Text>
            </View>
            <View style={[styles.th, { flex: FLEX.balAmt }]}>
              <Text style={[styles.head, styles.right]}>Amount {currency}</Text>
            </View>
          </View>

          {/* Opening balance row */}
          <View style={styles.row}>
            <View style={[styles.td, { flex: FLEX.date }]}>
              <Text style={[styles.cell, styles.bold]}>Opening Balance</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.ledger }]}>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.ref }]}>
              <Text style={styles.cell}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.voucher }]}>
              <Text style={styles.cell}></Text>
            </View>

            <View style={[styles.td, { flex: FLEX.inQty }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inRate }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inAmt }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>

            <View style={[styles.td, { flex: FLEX.outQty }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outRate }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outAmt }]}>
              <Text style={[styles.cell, styles.right]}>0</Text>
            </View>

            <View style={[styles.td, { flex: FLEX.balQty }]}>
              <Text style={[styles.cell, styles.right]}>{fmt0(openQty)}</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balRate }]}>
              <Text style={[styles.cell, styles.right]}>{fmt2(openRate)}</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balAmt }]}>
              <Text style={[styles.cell, styles.right]}>
                {fmt2(openAmount)}
              </Text>
            </View>
          </View>

          {/* Data rows */}
          {rows.map((r, i) => (
            <View style={styles.row} key={`r-${i}`}>
              <View style={[styles.td, { flex: FLEX.date }]}>
                <Text style={styles.cell}>{toDateStr(r?.date)}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.ledger }]}>
                <Text style={styles.cell}>{r?.ledgerName || ""}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.ref }]}>
                <Text style={styles.cell}>{r?.refNo || ""}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX.voucher }]}>
                <Text style={styles.cell}>{r?.voucherType || ""}</Text>
              </View>

              <View style={[styles.td, { flex: FLEX.inQty }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r?.inQty || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.inRate }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.inRate || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.inAmt }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.inAmount || 0)}
                </Text>
              </View>

              <View style={[styles.td, { flex: FLEX.outQty }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r?.outQty || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.outRate }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.outRate || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.outAmt }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.outAmount || 0)}
                </Text>
              </View>

              <View style={[styles.td, { flex: FLEX.balQty }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r?.balQty || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.balRate }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.balRate || 0)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX.balAmt }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r?.balAmount || 0)}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals row */}
          <View style={[styles.row, styles.totalRow]}>
            <View
              style={[
                styles.td,
                { flex: FLEX.date + FLEX.ledger + FLEX.ref + FLEX.voucher },
              ]}
            >
              <Text style={[styles.cell, styles.bold]}>Total</Text>
            </View>

            <View style={[styles.td, { flex: FLEX.inQty }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt0(t.inQty)}
              </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inRate }]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inAmt }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(t.inAmount)}
              </Text>
            </View>

            <View style={[styles.td, { flex: FLEX.outQty }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt0(t.outQty)}
              </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outRate }]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outAmt }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(t.outAmount)}
              </Text>
            </View>

            <View style={[styles.td, { flex: FLEX.balQty }]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balRate }]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balAmt }]}>
              <Text style={[styles.cell, styles.right]}></Text>
            </View>
          </View>

          {/* Closing balance row */}
          <View style={styles.row}>
            <View
              style={[
                styles.td,
                { flex: FLEX.date + FLEX.ledger + FLEX.ref + FLEX.voucher },
              ]}
            >
              <Text style={[styles.cell, styles.bold]}>Closing Balance</Text>
            </View>

            <View style={[styles.td, { flex: FLEX.inQty }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inRate }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.inAmt }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>

            <View style={[styles.td, { flex: FLEX.outQty }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outRate }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>
            <View style={[styles.td, { flex: FLEX.outAmt }]}>
              <Text style={[styles.cell, styles.right]}> </Text>
            </View>

            <View style={[styles.td, { flex: FLEX.balQty }]}>
              <Text style={[styles.cell, styles.right]}>{fmt0(closeQty)}</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balRate }]}>
              <Text style={[styles.cell, styles.right]}>{fmt2(closeRate)}</Text>
            </View>
            <View style={[styles.td, { flex: FLEX.balAmt }]}>
              <Text style={[styles.cell, styles.right]}>
                {fmt2(closeAmount)}
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
