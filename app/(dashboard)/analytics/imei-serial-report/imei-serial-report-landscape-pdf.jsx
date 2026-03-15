"use client";

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
import StandardReportHeader from "@/components/pdf/standard-report-header";

// Disable hyphenation so words like IMEI/Serial don't split across lines
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 16 },

  // Header
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 10,
  },
  logoWrap: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: { width: 80, height: 60, objectFit: "contain" },
  brandCenter: { flex: 1, textAlign: "center" },
  shopName: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  address: { fontSize: 8, color: "#374151", marginTop: 2 },
  contactRow: { fontSize: 8, color: "#4B5563", marginTop: 2 },

  // Make right column a bit wider and smaller font to avoid wrapping and oversized look
  brandRight: { width: 200, alignItems: "flex-end" },
  rightText: {
    fontSize: 7,
    color: "#374151",
    lineHeight: 1.15,
    textAlign: "right",
  },

  title: {
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
    fontWeight: "bold",
    color: "#111827",
  },
  metaRow: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: { fontSize: 8, color: "#374151" },
  metaStrong: { fontWeight: "bold", color: "#111827" },

  // Table
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#F3F4F6",
    padding: 5,
  },
  tableCol: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  groupCol: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    backgroundColor: "#F9FAFB",
  },
  tableCellHeader: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  tableCell: { fontSize: 7, color: "#111827" },
  centerText: { textAlign: "center" },
  //   rightText: { textAlign: "right" },
  summaryRow: { backgroundColor: "#F9FAFB", fontWeight: "bold" },

  // Column widths (sum 100)
  slCol: { width: "4%" },
  dateCol: { width: "8%" },
  brandCol: { width: "9%" },
  productCol: { width: "19%" },
  imeiCol: { width: "12%" },
  invoiceCol: { width: "10%" },
  purchaseCol: { width: "8%" },
  saleCol: { width: "8%" },
  condCol: { width: "8%" },
  vendorCol: { width: "7%" },
  customerCol: { width: "7%" },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signBlock: { width: "45%", alignItems: "flex-start" },
  signLine: {
    marginTop: 30,
    width: 180,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  signLabel: { fontSize: 8, color: "#374151", marginTop: 4 },
  signName: { fontSize: 9, color: "#111827", fontWeight: "bold" },
  signImage: { width: 100, height: 30, objectFit: "contain", marginBottom: 4 },
  pageNum: {
    position: "absolute",
    fontSize: 8,
    bottom: 10,
    right: 16,
    color: "#6B7280",
  },
});

function ImeiSerialReportPDFLandscape({
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
    // Return object with primary and secondary lines to render in PDF
    return {
      primary: r.productName || "",
      secondary: details.length ? details.join(" • ") : "",
    };
  };

  // --- add after buildProductTitle ---
  const computeWidths = (showImeiColumn, showPurchaseColumn) => {
    // base widths when all columns visible (sum = 100)
    const base = {
      slCol: 4,
      dateCol: 8,
      brandCol: 9,
      productCol: 19,
      imeiCol: 12,
      invoiceCol: 10,
      purchaseCol: 8,
      saleCol: 8,
      condCol: 8,
      vendorCol: 7,
      customerCol: 7,
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

  // compute widths depending on which columns are visible
  const widths = computeWidths(showImeiColumn, showPurchaseColumn);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
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

        {/* Table header */}
        <View style={styles.table}>
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
            <View style={[styles.tableColHeader, { width: widths.vendorCol }]}>
              <Text style={styles.tableCellHeader}>Vendor</Text>
            </View>
            <View
              style={[styles.tableColHeader, { width: widths.customerCol }]}
            >
              <Text style={styles.tableCellHeader}>Customer</Text>
            </View>
          </View>

          {/* Groups */}
          {data.map(({ group, rows }, gi) => (
            <View key={`g-${gi}`}>
              {/* Group title */}
              <View style={styles.tableRow}>
                <View style={styles.groupCol}>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {group}
                  </Text>
                </View>
              </View>

              {/* Rows */}
              {rows.map((r, ri) => (
                <View style={styles.tableRow} key={`r-${gi}-${ri}`}>
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
                                { fontSize: 7, color: "#374151", marginTop: 2 },
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
                    <Text style={styles.tableCell}>{r.invoiceNo || "-"}</Text>
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
                  <View style={[styles.tableCol, { width: widths.vendorCol }]}>
                    <Text style={styles.tableCell}>{r.vendorName}</Text>
                  </View>
                  <View
                    style={[styles.tableCol, { width: widths.customerCol }]}
                  >
                    <Text style={styles.tableCell}>{r.customerName}</Text>
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
            {/* keep IMEI slot visually present only if shown */}
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
            <View style={[styles.tableCol, { width: widths.vendorCol }]} />
            <View style={[styles.tableCol, { width: widths.customerCol }]} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signBlock}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Authorized By</Text>
          </View>
          <View style={styles.signBlock}>
            <View style={styles.signLine} />
            <Text style={styles.signLabel}>Received By</Text>
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

export default ImeiSerialReportPDFLandscape;
