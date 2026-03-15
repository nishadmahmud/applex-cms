import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import StandardReportHeader from "@/components/pdf/standard-report-header";

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 14 },
  // Header (same style as landscape, slightly tighter)
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 8,
    marginBottom: 8,
  },
  logoWrap: {
    width: 70,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logo: { width: 70, height: 52, objectFit: "contain" },
  brandCenter: { flex: 1, textAlign: "center" },
  shopName: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 7, color: "#374151", marginTop: 2 },
  contactRow: { fontSize: 7, color: "#4B5563", marginTop: 2 },
  brandRight: { width: 140, alignItems: "flex-end" },
  rightText: { fontSize: 7, color: "#374151" },
  title: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
  },
  metaRow: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    borderRadius: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaItem: { fontSize: 7, color: "#374151", marginRight: 8 },
  metaStrong: { fontWeight: "bold", color: "#111827" },

  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F3F4F6",
    padding: 4,
  },
  tableCol: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  groupCol: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    backgroundColor: "#F9FAFB",
  },
  tableCellHeader: { fontSize: 7, fontWeight: "bold", color: "#111827" },
  tableCell: { fontSize: 6.5, color: "#111827" },
  centerText: { textAlign: "center" },
  summaryRow: { backgroundColor: "#F9FAFB", fontWeight: "bold" },

  // Narrower columns for portrait (sum 100)
  slCol: { width: "5%" },
  dateCol: { width: "12%" },
  brandCol: { width: "12%" },
  productCol: { width: "22%" },
  imeiCol: { width: "16%" },
  invoiceCol: { width: "11%" },
  purchaseCol: { width: "7%" },
  saleCol: { width: "7%" },
  condCol: { width: "8%" },
  // To keep within 100, compress vendor and customer a bit
  vendorCol: { width: "0%" }, // hide vendor/customer on portrait to fit, but keep data in group or invoice if needed
  customerCol: { width: "0%" },

  pageNum: {
    position: "absolute",
    fontSize: 7,
    bottom: 8,
    right: 14,
    color: "#6B7280",
  },
});

function ImeiSerialReportPDFPortrait({
  data = [],
  totals,
  filters,
  user,
  showImeiColumn = true,
  showPurchaseColumn = true,
}) {
  const startDate = (filters?.start_date || "").toString().slice(0, 10);
  const endDate = (filters?.end_date || "").toString().slice(0, 10);
  const stockType = filters?.stock_type || "";

  const fmt = (n) =>
    Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

  // Helper to normalize storage display and battery
  const formatStorage = (s) => {
    if (s == null || s === "") return "";
    if (!isNaN(Number(s))) return `${Number(s)} GB`;
    const normalized = String(s).trim();
    const match = normalized.match(/^(\d+)\s*gb$/i);
    if (match) return `${match[1]} GB`;
    return normalized;
  };

  const buildProductTitle = (r) => {
    const storageText = formatStorage(r.storage);
    const batteryText =
      r.batteryLife != null && r.batteryLife !== ""
        ? `${r.batteryLife}%`
        : null;

    const details = [r.region, r.color, storageText, batteryText].filter(
      Boolean
    );
    return {
      primary: r.productName || "",
      secondary: details.length ? details.join(" • ") : "",
    };
  };

  // --- computeWidths helper (portrait-specific base widths) ---
  const computeWidths = (showImeiColumn, showPurchaseColumn) => {
    // base widths when all columns visible (sum = 100)
    const base = {
      slCol: 5,
      dateCol: 12,
      brandCol: 12,
      productCol: 22,
      imeiCol: 16,
      invoiceCol: 11,
      purchaseCol: 7,
      saleCol: 7,
      condCol: 8,
      vendorCol: 0, // portrait intentionally hides vendor/customer
      customerCol: 0,
    };

    // distribute widths of hidden columns into productCol
    let productExtra = 0;
    if (!showImeiColumn) productExtra += base.imeiCol;
    if (!showPurchaseColumn) productExtra += base.purchaseCol;

    const productCol = base.productCol + productExtra;

    // build final map (as strings with %)
    return {
      slCol: `${base.slCol}%`,
      dateCol: `${base.dateCol}%`,
      brandCol: `${base.brandCol}%`,
      productCol: `${productCol}%`,
      imeiCol: `${base.imeiCol}%`,
      invoiceCol: `${base.invoiceCol}%`,
      purchaseCol: `${base.purchaseCol}%`,
      saleCol: `${base.saleCol}%`,
      condCol: `${base.condCol}%`,
      vendorCol: `${base.vendorCol}%`,
      customerCol: `${base.customerCol}%`,
    };
  };

  // compute widths based on flags so table won't break when columns hidden
  const widths = computeWidths(showImeiColumn, showPurchaseColumn);

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <StandardReportHeader
          user={user}
          title="IMEI / Serial Report"
          reportLabel="IMEI / Serial"
          filters={filters}
          logoUrl={
            user?.invoice_settings?.shop_logo
              ? `/api/logo-proxy?url=${encodeURIComponent(
                  user.invoice_settings.shop_logo
                )}`
              : null
          }
          extraInfo={
            <>
              <Text style={{ fontSize: 8, color: "#374151" }}>
                Stock Type:{" "}
                {filters.stock_type === "stock_in"
                  ? "Stock In"
                  : filters.stock_type === "stock_out"
                  ? "Stock Out"
                  : "All"}
              </Text>
              <Text style={{ fontSize: 8, color: "#374151" }}>
                Items: {totals?.totalItems ?? 0}
              </Text>
            </>
          }
        />

        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: widths.slCol }]}>
              <Text style={[styles.tableCellHeader, styles.centerText]}>
                SL
              </Text>
            </View>

            <View style={[styles.tableColHeader, { width: widths.dateCol }]}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>

            <View style={[styles.tableColHeader, { width: widths.brandCol }]}>
              <Text style={styles.tableCellHeader}>Brand</Text>
            </View>

            <View style={[styles.tableColHeader, { width: widths.productCol }]}>
              <Text style={styles.tableCellHeader}>Product Name</Text>
            </View>

            {showImeiColumn && (
              <View style={[styles.tableColHeader, { width: widths.imeiCol }]}>
                <Text style={styles.tableCellHeader}>IMEI/Serial</Text>
              </View>
            )}

            <View style={[styles.tableColHeader, { width: widths.invoiceCol }]}>
              <Text style={styles.tableCellHeader}>Invoice No.</Text>
            </View>

            {showPurchaseColumn && (
              <View
                style={[styles.tableColHeader, { width: widths.purchaseCol }]}
              >
                <Text style={[styles.tableCellHeader, styles.rightText]}>
                  Purchase
                </Text>
              </View>
            )}

            <View style={[styles.tableColHeader, { width: widths.saleCol }]}>
              <Text style={[styles.tableCellHeader, styles.rightText]}>
                Sale
              </Text>
            </View>

            <View style={[styles.tableColHeader, { width: widths.condCol }]}>
              <Text style={styles.tableCellHeader}>Condition</Text>
            </View>
          </View>

          {/* Groups */}
          {data.map(({ group, rows }, gi) => (
            <View key={`pg-${gi}`}>
              <View style={styles.tableRow}>
                <View style={styles.groupCol}>
                  <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                    {group}
                  </Text>
                </View>
              </View>

              {rows.map((r, ri) => (
                <View style={styles.tableRow} key={`pr-${gi}-${ri}`}>
                  <View style={[styles.tableCol, { width: widths.slCol }]}>
                    <Text style={[styles.tableCell, styles.centerText]}>
                      #{r.slInGroup}
                    </Text>
                  </View>

                  <View style={[styles.tableCol, { width: widths.dateCol }]}>
                    <Text style={styles.tableCell}>{r.date}</Text>
                  </View>

                  <View style={[styles.tableCol, { width: widths.brandCol }]}>
                    <Text style={styles.tableCell}>{r.brand}</Text>
                  </View>

                  <View style={[styles.tableCol, { width: widths.productCol }]}>
                    {(() => {
                      const title = buildProductTitle(r);
                      return (
                        <>
                          <Text
                            style={[styles.tableCell, { fontWeight: "700" }]}
                          >
                            {title.primary}
                          </Text>
                          {title.secondary ? (
                            <Text
                              style={[
                                styles.tableCell,
                                {
                                  fontSize: 6.5,
                                  color: "#374151",
                                  marginTop: 2,
                                },
                              ]}
                            >
                              {title.secondary}
                            </Text>
                          ) : null}
                        </>
                      );
                    })()}
                  </View>

                  {showImeiColumn && (
                    <View style={[styles.tableCol, { width: widths.imeiCol }]}>
                      <Text style={styles.tableCell}>{r.imei || "-"}</Text>
                    </View>
                  )}

                  <View style={[styles.tableCol, { width: widths.invoiceCol }]}>
                    <Text style={styles.tableCell}>
                      {r.invoiceNo.split("-").pop() || "-"}
                    </Text>
                  </View>

                  {showPurchaseColumn && (
                    <View
                      style={[styles.tableCol, { width: widths.purchaseCol }]}
                    >
                      <Text style={[styles.tableCell, styles.rightText]}>
                        {fmt(r.purchasePrice)}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.tableCol, { width: widths.saleCol }]}>
                    <Text style={[styles.tableCell, styles.rightText]}>
                      {fmt(r.salePrice)}
                    </Text>
                  </View>

                  <View style={[styles.tableCol, { width: widths.condCol }]}>
                    <Text style={styles.tableCell}>{r.productCondition}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}

          {/* Summary */}
          <View style={[styles.tableRow, styles.summaryRow]}>
            <View style={[styles.tableCol, { width: widths.slCol }]}>
              <Text style={[styles.tableCell, styles.centerText]}>
                {totals?.totalItems ?? 0}
              </Text>
            </View>

            <View style={[styles.tableCol, { width: widths.dateCol }]}>
              <Text style={styles.tableCell}>Items</Text>
            </View>

            <View style={[styles.tableCol, { width: widths.brandCol }]} />

            <View style={[styles.tableCol, { width: widths.productCol }]} />

            {showImeiColumn ? (
              <View style={[styles.tableCol, { width: widths.imeiCol }]} />
            ) : null}

            <View style={[styles.tableCol, { width: widths.invoiceCol }]}>
              <Text style={styles.tableCell}>
                In/Out: {totals?.inStockCount ?? 0}/{totals?.outStockCount ?? 0}
              </Text>
            </View>

            {showPurchaseColumn && (
              <View style={[styles.tableCol, { width: widths.purchaseCol }]}>
                <Text style={[styles.tableCell, styles.rightText]}>
                  {(totals?.totalPurchase ?? 0).toLocaleString()}
                </Text>
              </View>
            )}

            <View style={[styles.tableCol, { width: widths.saleCol }]}>
              <Text style={[styles.tableCell, styles.rightText]}>
                {(totals?.totalSale ?? 0).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.tableCol, { width: widths.condCol }]} />
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

export default ImeiSerialReportPDFPortrait;
