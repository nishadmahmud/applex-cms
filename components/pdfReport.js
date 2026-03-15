"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "11.11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "11.11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 8,
    textAlign: "center",
  },
  summarySection: {
    marginTop: 10,
    borderTop: 2,
    borderTopColor: "#000000",
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    backgroundColor: "#f5f5f5",
    padding: 5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

// PDF Document Component
const PDFReportDocument = ({ data, reportTitle, userInfo, totals }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{reportTitle}</Text>
        <Text style={styles.subtitle}>
          Generated on: {new Date().toLocaleDateString()}
        </Text>
        {userInfo && (
          <View style={styles.userInfo}>
            <Text>Outlet: {userInfo.outlet_name}</Text>
            <Text>User: {userInfo.name}</Text>
          </View>
        )}
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>SL</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Transaction Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Voucher Number</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Customer Name</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Order Type</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Product Name</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Qty</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Sales Amount</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Purchase Amount</Text>
          </View>
        </View>

        {/* Table Body */}
        {data.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{index + 1}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.invoice_id || "N/A"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {item.customer_name || "N/A"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Shop</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.product_name || "N/A"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.qty || 0}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                ৳{Number.parseFloat(item.price || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                ৳{Number.parseFloat(item.purchase_price || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{totals.activeDays} Days</Text>
          <Text style={styles.summaryLabel}>Grand Total</Text>
          <Text style={styles.summaryValue}>
            ৳{totals.totalSales.toFixed(2)}
          </Text>
          <Text style={styles.summaryValue}>
            ৳{totals.totalPurchase.toFixed(2)}
          </Text>
          <Text style={styles.summaryValue}>
            ৳{totals.totalProfit.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount Total</Text>
          <Text style={styles.summaryValue}>৳0.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Actual Grand Total</Text>
          <Text style={styles.summaryValue}>
            ৳{totals.totalSales.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Profit Total</Text>
          <Text style={styles.summaryValue}>
            ৳{totals.totalProfit.toFixed(2)}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

// Export function
export const generatePDF = async (data, reportTitle, userInfo, totals) => {
  const doc = (
    <PDFReportDocument
      data={data}
      reportTitle={reportTitle}
      userInfo={userInfo}
      totals={totals}
    />
  );
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportTitle.replace(/\s+/g, "_")}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default PDFReportDocument;
