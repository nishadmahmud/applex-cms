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
    marginBottom: 6,
  },

  // Table base
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

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },

  totalRow: { backgroundColor: "#E5E7EB" },

  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

// Flex map for details table
const FLEX_DTL = {
  sl: 5,
  date: 13,
  category: 13,
  product: 24,
  customer: 13,
  invoice: 14,
  qty: 8,
  amount: 10,
  due: 10,
};

// Flex map for top categories table
const FLEX_TOP = {
  sl: 6,
  name: 30,
  count: 12,
  products: 12,
  amount: 20,
  due: 20,
};

function toLocalDate(d) {
  try {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toISOString().slice(0, 10);
  } catch {
    return String(d || "");
  }
}

function Header({ user, filters, summary }) {
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

  const start = filters?.start_date ? toLocalDate(filters.start_date) : "-";
  const end = filters?.end_date ? toLocalDate(filters.end_date) : "-";

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
          <Text style={styles.rightLine}>
            Report: Category Sale (Date-wise)
          </Text>
          <Text style={styles.rightLine}>
            Period: {start} to {end}
          </Text>
          <Text style={styles.rightLine}>
            Categories: {fmt0(summary.totalCategories)} | Sold:{" "}
            {fmt0(summary.soldCategories)}
          </Text>
          <Text style={styles.rightLine}>
            Sold: {fmt2(summary.soldAmount)} BDT
          </Text>
          <Text style={styles.rightLine}>
            Paid: {fmt2(summary.paidAmount)} BDT
          </Text>
          <Text style={styles.rightLine}>
            Due: {fmt2(summary.dueAmount)} BDT
          </Text>
          <Text style={styles.rightLine}>Generated: {genStr}</Text>
        </View>
      </View>

      <Text style={styles.title}>Category Sale Report</Text>
    </>
  );
}

// Normalizers to make the PDF resilient to prop-name and field-name differences
function normalizeDetails(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map((r) => ({
    date: r?.date ?? r?.created_at ?? "",
    category: r?.category ?? r?.category_name ?? "",
    product: r?.product ?? r?.product_name ?? "",
    customer: r?.customer ?? r?.customer_name ?? "",
    invoice: r?.invoice ?? r?.invoice_id ?? "",
    qty: Number(r?.qty ?? r?.total_sale ?? 0),
    amount: Number(r?.amount ?? r?.total_sale_amount ?? 0),
    due: Number(r?.due ?? r?.total_due ?? 0),
  }));
}
function normalizeTop(arr = []) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c) => ({
    name: c?.name ?? c?.category_name ?? "",
    category_count: Number(c?.category_count ?? c?.count ?? 0),
    total_products_sold: Number(c?.total_products_sold ?? c?.products ?? 0),
    amount: Number(c?.amount ?? 0),
    total_due_amount: Number(c?.total_due_amount ?? c?.due ?? 0),
    date: c?.date ?? "",
  }));
}

export default function CategorySaleReportPDF(props) {
  // Accept multiple prop names for maximum compatibility
  const {
    user,
    filters = { start_date: null, end_date: null },
    summary = {
      totalCategories: 0,
      soldCategories: 0,
      soldAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
    },
  } = props;

  // Fallback order for detail rows
  const detailCandidates = [
    props.detailRows,
    props.rows,
    props.details,
    props.items,
  ].filter((a) => Array.isArray(a) && a.length > 0);
  const rawDetailRows = detailCandidates[0] || [];
  const detailRows = normalizeDetails(rawDetailRows);

  // Fallback order for top rows
  const topCandidates = [props.topRows, props.top, props.topCategories].filter(
    (a) => Array.isArray(a) && a.length > 0
  );
  const rawTopRows = topCandidates[0] || [];
  const topRows = normalizeTop(rawTopRows);

  // Compute totals from normalized details
  const totals = detailRows.reduce(
    (acc, r) => {
      acc.qty += Number(r?.qty || 0);
      acc.amount += Number(r?.amount || 0);
      acc.due += Number(r?.due || 0);
      return acc;
    },
    { qty: 0, amount: 0, due: 0 }
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header user={user} filters={filters} summary={summary} />

        {/* Detail table */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, { flex: FLEX_DTL.sl }]}>
              <Text style={[styles.head, styles.center]}>SL</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.date }]}>
              <Text style={styles.head}>Date</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.category }]}>
              <Text style={styles.head}>Category</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.product }]}>
              <Text style={styles.head}>Product</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.customer }]}>
              <Text style={styles.head}>Customer</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.invoice }]}>
              <Text style={styles.head}>Invoice</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.qty }]}>
              <Text style={[styles.head, styles.right]}>Qty</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.amount }]}>
              <Text style={[styles.head, styles.right]}>Amount (BDT)</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_DTL.due }]}>
              <Text style={[styles.head, styles.right]}>Due (BDT)</Text>
            </View>
          </View>

          {detailRows.map((r, i) => (
            <View style={styles.row} key={`d-${i}`}>
              <View style={[styles.td, { flex: FLEX_DTL.sl }]}>
                <Text style={[styles.cell, styles.center]}>{i + 1}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.date }]}>
                <Text style={styles.cell}>{toLocalDate(r.date)}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.category }]}>
                <Text style={styles.cell}>{r.category}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.product }]}>
                <Text style={styles.cell}>{r.product}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.customer }]}>
                <Text style={styles.cell}>{r.customer}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.invoice }]}>
                <Text style={styles.cell}>{r.invoice}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.qty }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.qty)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.amount }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.amount)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX_DTL.due }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.due)}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <View
              style={[
                styles.td,
                {
                  flex:
                    FLEX_DTL.sl +
                    FLEX_DTL.date +
                    FLEX_DTL.category +
                    FLEX_DTL.product +
                    FLEX_DTL.customer +
                    FLEX_DTL.invoice,
                },
              ]}
            >
              <Text style={styles.cell}>Totals</Text>
            </View>
            <View style={[styles.td, { flex: FLEX_DTL.qty }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt0(totals.qty)}
              </Text>
            </View>
            <View style={[styles.td, { flex: FLEX_DTL.amount }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(totals.amount)}
              </Text>
            </View>
            <View style={[styles.td, { flex: FLEX_DTL.due }]}>
              <Text style={[styles.cell, styles.right]} wrap={false}>
                {fmt2(totals.due)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top categories */}
        <Text style={styles.sectionTitle}>Most Selling Categories</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={[styles.th, { flex: FLEX_TOP.sl }]}>
              <Text style={[styles.head, styles.center]}>SL</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_TOP.name }]}>
              <Text style={styles.head}>Category</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_TOP.count }]}>
              <Text style={[styles.head, styles.right]}>Invoices</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_TOP.products }]}>
              <Text style={[styles.head, styles.right]}>Products</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_TOP.amount }]}>
              <Text style={[styles.head, styles.right]}>Amount (BDT)</Text>
            </View>
            <View style={[styles.th, { flex: FLEX_TOP.due }]}>
              <Text style={[styles.head, styles.right]}>Due (BDT)</Text>
            </View>
          </View>

          {topRows.map((r, i) => (
            <View style={styles.row} key={`t-${i}`}>
              <View style={[styles.td, { flex: FLEX_TOP.sl }]}>
                <Text style={[styles.cell, styles.center]}>{i + 1}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_TOP.name }]}>
                <Text style={styles.cell}>{r.name}</Text>
              </View>
              <View style={[styles.td, { flex: FLEX_TOP.count }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.category_count)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX_TOP.products }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt0(r.total_products_sold)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX_TOP.amount }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.amount)}
                </Text>
              </View>
              <View style={[styles.td, { flex: FLEX_TOP.due }]}>
                <Text style={[styles.cell, styles.right]} wrap={false}>
                  {fmt2(r.total_due_amount)}
                </Text>
              </View>
            </View>
          ))}
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
