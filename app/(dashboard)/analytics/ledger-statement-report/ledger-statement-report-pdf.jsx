/* eslint-disable react/react-in-jsx-scope */
"use client"

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 15 },
  dateRange: { fontSize: 9, color: "#999", marginBottom: 10 },
   dateRanget: {
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    marginBottom: 15,
    marginTop: 10,
  },
  summarySection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  summaryLabel: { fontSize: 10, fontWeight: "bold" },
  summaryValue: { fontSize: 10, fontWeight: "bold", textAlign: "right" },
  table: { marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: "#999" },
  tableRow: { flexDirection: "row" },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#e5e5e5",
    borderRightWidth: 1,
    borderRightColor: "#999",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
    logoImg: {
    width: 100,
    height: 100,
    marginTop: 0,
  },

  imageBorder: {
    width: "30%",
    borderRight: 1,
    borderColor: "#b0b0b0",
    marginRight: 15,
  },

  leftSection: {
    width: "60%",
    flexDirection: "column",
    paddingBottom: 10,
    paddingTop: 10,
    borderRight: 1,
    borderColor: "#b0b0b0",
    paddingRight: 15,
  },
  businessName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  addressLine: {
    fontSize: 9,
    marginTop: 1,
    color: "#333",
  },
  infoText: {
    fontSize: 9,
    marginTop: 1,
    color: "#333",
  },
  rightSection: {
    width: "40%",
    alignItems: "flex-end",
    flexDirection: "column",
  },

   refBox: {
    alignItems: "flex-end",
  },
  refText: {
    fontSize: 10,
    marginTop: 2,
  },
 reportTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
    paddingBottom: 7,
    borderBottom: 1,
    borderColor: "#b0b0b0",
    color: "#000",
  },

 
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#999",
    borderRightWidth: 1,
    borderRightColor: "#999",
  },
  textRight: { textAlign: "right" },
  openingBalanceRow: { backgroundColor: "#e3f2fd", fontWeight: "bold" },
  totalRow: { backgroundColor: "#f7dcda", color: "#d94338", fontWeight: 600, borderTopWidth: 0, borderTopColor: "#ddd" },
  footer: { marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", fontSize: 8, color: "#999", textAlign: "center" },
})

export default function LedgerStatementReportPDF({ logoUrl, ledgerEntries, summaryTotals, filters, user }) {
  const startDate = new Date(filters.start_date).toLocaleDateString()
  const endDate = new Date(filters.end_date).toLocaleDateString()
  const logo = logoUrl || null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
         <View style={styles.headerContainer}>
                  <View style={styles.imageBorder}>
                    <Image
                      src={logo}
                      // source={dizmo}
                      style={styles.logoImg}
                    />
                  </View>
                  {/* LEFT SIDE - BUSINESS INFO */}
                  <View style={styles.leftSection}>
                    <Text style={styles.businessName}>{user?.outlet_name || "Business Name"}</Text>
                    <Text style={styles.addressLine}>{user?.address || "Address not available"}</Text>
                    <Text style={styles.infoText}>Mobile: {user?.phone || "-"}</Text>
                    <Text style={styles.infoText}>Email: {user?.email || "-"}</Text>
                    {user?.web_address && <Text style={styles.infoText}>Web: {user.web_address}</Text>}
                  </View>
        
                  {/* RIGHT SIDE - LOGO & BARCODE */}
                  <View style={styles.rightSection}>
                    {/* <BarCodeLable barcodeValue="123456789012" /> */}
                    {/* BARCODE / REF NUMBER */}
                    <View style={styles.refBox}>
                      {user?.barcode && (
                        <Image src={user.barcode || "/placeholder.svg"} style={styles.barcodeImg} cache={false} />
                      )}
                      <Text style={styles.refText}>Ref No: {user?.ref_no || "---"}</Text>
                      <Text style={styles.refText}>Date: {new Date().toLocaleDateString() || "---"}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.reportTitle}>LEDGER STATEMENT REPORT</Text>
                
                        <Text style={styles.dateRanget}>
                          Start Date: {startDate}                             End Date:{" "}
                          {endDate}
                        </Text>

        {/* Ledger Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.5 }}>Date</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 3.5 }}>Particulars</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.25, textAlign: "right" }}>Debit</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.25, textAlign: "right" }}>Credit</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1.5, textAlign: "right" }}>Balance</Text>
            <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>Remarks</Text>
          </View>

          {/* Opening Balance */}
          <View style={{ ...styles.tableRow, ...styles.openingBalanceRow }}>
            <Text style={{ ...styles.tableCell, flex: 1.5 }}></Text>
            <Text style={{ ...styles.tableCell, flex: 3.5 }}>Opening Balance</Text>
            <Text style={{ ...styles.tableCell, flex: 1.25 }}></Text>
            <Text style={{ ...styles.tableCell, flex: 1.25 }}></Text>
            <Text style={{ ...styles.tableCell, flex: 1.5, textAlign: "right" }}>{fmt2(summaryTotals.opening_balance)}</Text>
            <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
          </View>

          {/* Ledger Entries */}
          {ledgerEntries?.map((entry, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={{ ...styles.tableCell, flex: 1.5 }}>{entry.date ? new Date(entry.date).toLocaleDateString() : "-"}</Text>
              <Text style={{ ...styles.tableCell, flex: 3.5 }}>{entry.particulars || "-"}</Text>
              <Text style={{ ...styles.tableCell, flex: 1.25, textAlign: "right" }}>{fmt2(entry.debit)}</Text>
              <Text style={{ ...styles.tableCell, flex: 1.25, textAlign: "right" }}>{fmt2(entry.credit)}</Text>
              <Text style={{ ...styles.tableCell, flex: 1.5, textAlign: "right" }}>{fmt2(entry.balance)}</Text>
              <Text style={{ ...styles.tableCell, flex: 1 }}>{entry.remarks || "-"}</Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={{ ...styles.tableRow, ...styles.totalRow }}>
            <Text style={{ ...styles.tableCell, flex: 1.5 }}></Text>
            <Text style={{ ...styles.tableCell, flex: 3.5 }}>Total</Text>
            <Text style={{ ...styles.tableCell, flex: 1.25, textAlign: "right" }}>{fmt2(summaryTotals.total_debit)}</Text>
            <Text style={{ ...styles.tableCell, flex: 1.25, textAlign: "right" }}>{fmt2(summaryTotals.total_credit)}</Text>
            <Text style={{ ...styles.tableCell, flex: 1.5, textAlign: "right" }}>{fmt2(summaryTotals.closing_balance)}</Text>
            <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  )
}
