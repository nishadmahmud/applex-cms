import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "10%", // default, overridden per-column below
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "10%", // default, overridden per-column below
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 7,
  },
  summaryRow: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },

  // Column width overrides (sum to 100%)
  slCol: { width: "5%" },
  dateCol: { width: "10%" },
  voucherCol: { width: "14%" },
  customerCol: { width: "14%" },
  orderTypeCol: { width: "8%" },
  productCol: { width: "16%" },
  qtyCol: { width: "6%" },
  salesCol: { width: "9%" },
  purchaseCol: { width: "9%" },
  profitCol: { width: "9%" },

  // Alignment helpers
  centerText: { textAlign: "center" },
  rightText: { textAlign: "right" },
});

const SalesReportPDF = ({ data, totals, filters }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.header}>Monthly Sales Day Counting Report</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, styles.slCol]}>
            <Text style={[styles.tableCellHeader, styles.centerText]}>SL</Text>
          </View>
          <View style={[styles.tableColHeader, styles.dateCol]}>
            <Text style={styles.tableCellHeader}>Transaction Date</Text>
          </View>
          <View style={[styles.tableColHeader, styles.voucherCol]}>
            <Text style={styles.tableCellHeader}>Voucher Number</Text>
          </View>
          <View style={[styles.tableColHeader, styles.customerCol]}>
            <Text style={styles.tableCellHeader}>Customer Name</Text>
          </View>
          <View style={[styles.tableColHeader, styles.orderTypeCol]}>
            <Text style={styles.tableCellHeader}>Order Type</Text>
          </View>
          <View style={[styles.tableColHeader, styles.productCol]}>
            <Text style={styles.tableCellHeader}>Product Name</Text>
          </View>
          <View style={[styles.tableColHeader, styles.qtyCol]}>
            <Text style={[styles.tableCellHeader, styles.centerText]}>Qty</Text>
          </View>
          <View style={[styles.tableColHeader, styles.salesCol]}>
            <Text style={[styles.tableCellHeader, styles.rightText]}>
              Sales Amount
            </Text>
          </View>
          <View style={[styles.tableColHeader, styles.purchaseCol]}>
            <Text style={[styles.tableCellHeader, styles.rightText]}>
              Purchase Amount
            </Text>
          </View>
          <View style={[styles.tableColHeader, styles.profitCol]}>
            <Text style={[styles.tableCellHeader, styles.rightText]}>
              Profit
            </Text>
          </View>
        </View>

        {/* Data Rows */}
        {data.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={[styles.tableCol, styles.slCol]}>
              <Text style={[styles.tableCell, styles.centerText]}>
                {item.sl}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.dateCol]}>
              <Text style={styles.tableCell}>{item.transactionDate}</Text>
            </View>
            <View style={[styles.tableCol, styles.voucherCol]}>
              <Text style={styles.tableCell}>{item.voucherNumber}</Text>
            </View>
            <View style={[styles.tableCol, styles.customerCol]}>
              <Text style={styles.tableCell}>{item.customerName}</Text>
            </View>
            <View style={[styles.tableCol, styles.orderTypeCol]}>
              <Text style={styles.tableCell}>{item.orderType}</Text>
            </View>
            <View style={[styles.tableCol, styles.productCol]}>
              <Text style={styles.tableCell}>{item.productName}</Text>
            </View>
            <View style={[styles.tableCol, styles.qtyCol]}>
              <Text style={[styles.tableCell, styles.centerText]}>
                {item.qty}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.salesCol]}>
              <Text style={[styles.tableCell, styles.rightText]}>
                {item.salesAmount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.purchaseCol]}>
              <Text style={[styles.tableCell, styles.rightText]}>
                {item.purchaseAmount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.tableCol, styles.profitCol]}>
              <Text style={[styles.tableCell, styles.rightText]}>
                {item.profit.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Summary Row */}
        <View style={[styles.tableRow, styles.summaryRow]}>
          <View style={[styles.tableCol, styles.slCol]}>
            <Text style={[styles.tableCell, styles.centerText]}>
              {totals.totalDays} Days
            </Text>
          </View>
          <View style={[styles.tableCol, styles.dateCol]}>
            <Text style={styles.tableCell}>Grand Total</Text>
          </View>
          <View style={[styles.tableCol, styles.voucherCol]}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={[styles.tableCol, styles.customerCol]}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={[styles.tableCol, styles.orderTypeCol]}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={[styles.tableCol, styles.productCol]}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={[styles.tableCol, styles.qtyCol]}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={[styles.tableCol, styles.salesCol]}>
            <Text style={[styles.tableCell, styles.rightText]}>
              {totals.totalSales.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCol, styles.purchaseCol]}>
            <Text style={[styles.tableCell, styles.rightText]}>
              {totals.totalPurchase.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.tableCol, styles.profitCol]}>
            <Text style={[styles.tableCell, styles.rightText]}>
              {totals.totalProfit.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default SalesReportPDF;
