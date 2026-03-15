/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
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

  barcodeImg: {
    width: 110,
    height: 35,
    marginBottom: 5,
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
  dateRange: {
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    paddingBottom: 3,
   
  },

  table: {
    width: "100%",
    marginBottom: 15,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    backgroundColor: "#f5f5f5",
    marginBottom: 2,
  },

  // tableRow: {
  //   flexDirection: "row",
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#ddd",
  //   minHeight: 18,
  // },

  tableCellHeader: {
    padding: 5,
    fontSize: 9,
    fontWeight: 600,
    color: "#000",
  },
  totaltableCellHeader: {
    padding: 5,
    fontSize: 9,
    fontWeight: 600,
    color: "red",
  },

  tableCell: {
    padding: 5,
    fontSize: 8.5,
    color: "#333",
    borderRight: "1px solid #D1D5DB",
   
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 0,
    borderRight: 1,
    borderLeft:1,
    borderColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  rowGray: {
    backgroundColor: "#f2f2f2",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
  
  textRight: {
    textAlign: "right",
  },

 
  totalRow: {
    fontWeight: "bold",
    backgroundColor: "#ffe3e3",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  openingBalanceItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 10,
  },

  bulletPoint: {
    width: "5%",
    fontSize: 9,
  },

  itemText: {
    width: "70%",
    fontSize: 9,
    color: "#333",
  },

  itemAmount: {
    width: "25%",
    fontSize: 9,
    textAlign: "right",
    fontWeight: "bold",
    color: "#333",
  },

  // opening balance table
  tableWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 1,

    marginTop: 10,
  },

  osectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    borderBottom: "1px solid #D1D5DB",
  },

  headerRow: {
    backgroundColor: "#E5E7EB",
  },

  cell: {
    padding: 6,
    fontSize: 10,
    borderRight: "1px solid #D1D5DB",
  },

  otextRight: {
    textAlign: "right",
  },

  bold: {
    fontWeight: "bold",
  },

  ototalRow: {
    backgroundColor: "#F3F4F6",
  },

  /* COLUMN WIDTHS */
  snCol: {
    width: "10%",
  },
  particularCol: {
    width: "30%",
   
  },
  typeCol: {
    width: "35%",
  },
  amountCol: {
    width: "25%",
  },
  totalCel: {
     color: "red"
  },

  colItem: {
    paddingVertical: 4,
  },

  inflowSectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
  },

  inflowTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },

  inflowRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 4,
  },

  inflowCell: {
    fontSize: 9,
    paddingLeft: 4,
    
  },

  inflowRight: {
    textAlign: "right",
    paddingRight: 4,
  },
})

const fmt2 = (n) =>
  Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export default function CashStatementReportPDF({
  openingBalance,
  transactionSummary,
  summaryTotals,
  inflowRows,
  outflowRows,
  filters,
  logoUrl,
  user,
}) {

  const flattenedInflowRows = []

  if (inflowRows?.sales?.length) {
    inflowRows.sales.forEach((item) => {
      flattenedInflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type_name || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }

  if (inflowRows?.purchase_return?.length) {
    inflowRows.purchase_return.forEach((item) => {
      flattenedInflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type_category_name || item.payment_type_name || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }

  if (inflowRows?.expense_credit?.length) {
    inflowRows.expense_credit.forEach((item) => {
      flattenedInflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }


  // outflow rows
  const flattenedOutflowRows = []

  if (outflowRows?.purchase?.length) {
    outflowRows.purchase.forEach((item) => {
      flattenedOutflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type_name || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }

  if (outflowRows?.sales_return?.length) {
    outflowRows.sales_return.forEach((item) => {
      flattenedOutflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type_category_name || item.payment_type_name || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }

  if (outflowRows?.expense_debit?.length) {
    outflowRows.expense_debit.forEach((item) => {
      flattenedOutflowRows.push({
        invoice_id: item.invoice_id,
        paymentType: item.payment_type || "Unknown",
        amount: Number(item.amount) || 0,
      })
    })
  }
  const logo = logoUrl || null;
  return (
    <Document>
      {/* ================= FIRST PAGE - HEADER & OPENING BALANCE ================= */}
      <Page size="A4" style={styles.page}>
        {/* TOP HEADER */}
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

        {/* REPORT TITLE & DATE RANGE */}
        <Text style={styles.reportTitle}>DAILY CASH STATEMENT</Text>

        <Text style={styles.dateRange}>
          Start Date: {new Date(filters.start_date).toLocaleDateString()}                         End Date:{" "}
          {new Date(filters.end_date).toLocaleDateString()}
        </Text>

        {/* dynamic opening balance data */}
        {openingBalance.length > 0 && (
          <View style={styles.tableWrapper}>
            {/* TABLE HEADER */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.snCol]}>SN</Text>
              <Text style={[styles.cell, styles.particularCol]}>Particular</Text>
              <Text style={[styles.cell, styles.typeCol]}>Type</Text>
              <Text style={[styles.cell, styles.amountCol]}>Amount</Text>
            </View>

            {/* ONE GROUPED ROW (NO REPEATING TEXT) */}
            <View style={styles.row}>
              {/* SN */}
              <Text style={[styles.cell, styles.snCol]}>1</Text>

              {/* PARTICULAR (only once) */}
              <Text style={[styles.cell, styles.particularCol, styles.fontBold]}>Opening Balance</Text>

              {/* TYPE COLUMN: all types under one cell */}
              <View style={[styles.cell, styles.typeCol]}>
                {openingBalance.map((row, idx) => {
                 const displayType = row.payment_type_category_name || "-";

                  return (
                    <Text key={idx} style={styles.colItem}>
                      {displayType}
                    </Text>
                  )
                })}
              </View>

              {/* AMOUNT COLUMN: all values under one cell */}
              <View style={[styles.cell, styles.amountCol]}>
                {openingBalance.map((row, idx) => (
                  <Text key={idx} style={[styles.colItem, styles.textRight]}>
                    {fmt2(row.opening_balance)}
                  </Text>
                ))}
              </View>
            </View>

            {/* TOTAL ROW */}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={[styles.cell, styles.snCol]}></Text>
              <Text style={[styles.cell, styles.particularCol, styles.bold, styles.totalCel]}>Total Opening Balance</Text>
              <Text style={[styles.cell, styles.typeCol]}></Text>
              <Text style={[styles.cell, styles.amountCol, styles.totalCel, styles.textRight, styles.bold]}>
                {fmt2(summaryTotals.total_opening_balance)}
              </Text>
            </View>
          </View>
        )}

         {/* ================= INFLOW PAGE ================= */}
      {flattenedInflowRows.length > 0 && (
       <>
        <Text style={styles.inflowSectionTitle}>• Inflow of Fund</Text>

          {inflowRows?.sales?.length > 0 && (
            <View>
              <Text style={{ ...styles.inflowSectionTitle, marginTop: 6, marginBottom: 6, fontSize: 10, color: "#3f3f40", fontWeight: 600 }}>- Sales</Text>
              <View style={styles.table}>
               

                {inflowRows.sales.map((row, index) => (
  <View
    key={index}
    style={[
      styles.tableRow,
      index % 2 === 0 ? styles.rowGray : styles.rowWhite
    ]}
  >
    <View style={{ width: "40%" }}>
      <Text style={styles.tableCell}>{row.invoice_id}</Text>
    </View>

    <View style={{ width: "30%" }}>
      <Text style={styles.tableCell}>{row.payment_type_name || "Unknown"}</Text>
    </View>

    <View style={{ width: "30%" }}>
      <Text style={{ ...styles.tableCell, ...styles.textRight }}>
        {fmt2(Number(row.amount) || 0)}
      </Text>
    </View>
  </View>
))}

              </View>
            </View>
          )}

          {inflowRows?.purchase_return?.length > 0 && (
  <View>
    <Text
      style={{
        ...styles.inflowSectionTitle,
        marginTop: 6,
        marginBottom: 6,
        fontSize: 10,
        color: "#3f3f40",
        fontWeight: 600,
      }}
    >
      - Purchase Return
    </Text>

    <View style={styles.table}>
      {inflowRows.purchase_return.map((row, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.rowGray : styles.rowWhite
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={styles.tableCell}>{row.invoice_id}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={styles.tableCell}>
              {row.payment_type_category_name ||
                row.payment_type_name ||
                "Unknown"}
            </Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={{ ...styles.tableCell, ...styles.textRight }}>
              {fmt2(Number(row.amount) || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)}


          {inflowRows?.expense_credit?.length > 0 && (
  <View>
    <Text
      style={{
        ...styles.inflowSectionTitle,
        marginTop: 6,
        marginBottom: 6,
        fontSize: 10,
      }}
    >
      - Expense Credit
    </Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <View style={{ width: "40%" }}>
          <Text style={styles.tableCellHeader}>Invoice ID</Text>
        </View>
        <View style={{ width: "30%" }}>
          <Text style={styles.tableCellHeader}>Payment Type</Text>
        </View>
        <View style={{ width: "30%" }}>
          <Text style={{ ...styles.tableCellHeader, ...styles.textRight }}>
            Amount
          </Text>
        </View>
      </View>

      {inflowRows.expense_credit.map((row, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.rowGray : styles.rowWhite
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={styles.tableCell}>{row.invoice_id}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={styles.tableCell}>{row.payment_type || "Unknown"}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={{ ...styles.tableCell, ...styles.textRight }}>
              {fmt2(Number(row.amount) || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)}

       </>
      )}


 {/* ================= OUTFLOW PAGE ================= */}
      {flattenedOutflowRows.length > 0 && (
       <>
        <Text style={styles.inflowSectionTitle}>• Outflow of Fund</Text>

          {outflowRows?.sales?.length > 0 && (
  <View>
    <Text
      style={{
        ...styles.inflowSectionTitle,
        marginTop: 6,
        marginBottom: 6,
        fontSize: 10,
        color: "#3f3f40",
        fontWeight: 600,
      }}
    >
      - Sales
    </Text>

    <View style={styles.table}>
      {outflowRows.sales.map((row, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.rowGray : styles.rowWhite,
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={styles.tableCell}>{row.invoice_id}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={styles.tableCell}>
              {row.payment_type_name || "Unknown"}
            </Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={{ ...styles.tableCell, ...styles.textRight }}>
              {fmt2(Number(row.amount) || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)}


          {outflowRows?.sales_return?.length > 0 && (
  <View>
    <Text
      style={{
        ...styles.inflowSectionTitle,
        marginTop: 6,
        marginBottom: 6,
        fontSize: 10,
        color: "#3f3f40",
        fontWeight: 600,
      }}
    >
      - Sales Return
    </Text>

    <View style={styles.table}>
      {outflowRows.sales_return.map((row, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.rowGray : styles.rowWhite
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={styles.tableCell}>{row.invoice_id}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={styles.tableCell}>
              {row.payment_type_category_name || row.payment_type_name || "Unknown"}
            </Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={{ ...styles.tableCell, ...styles.textRight }}>
              {fmt2(Number(row.amount) || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)}

          {outflowRows?.expense_debit?.length > 0 && (
  <View>
    <Text
      style={{
        ...styles.inflowSectionTitle,
        marginTop: 6,
        marginBottom: 6,
        fontSize: 10,
        color: "#3f3f40",
        fontWeight: 600,
      }}
    >
      - Expense Debit
    </Text>

    <View style={styles.table}>
      

      {outflowRows.expense_debit.map((row, index) => (
        <View
          key={index}
          style={[
            styles.tableRow,
            index % 2 === 0 ? styles.rowGray : styles.rowWhite
          ]}
        >
          <View style={{ width: "40%" }}>
            <Text style={styles.tableCell}>{row.invoice_id}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={styles.tableCell}>{row.payment_type || "Unknown"}</Text>
          </View>

          <View style={{ width: "30%" }}>
            <Text style={{ ...styles.tableCell, ...styles.textRight }}>
              {fmt2(Number(row.amount) || 0)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)}

       </>
      )}

      <>
       <Text style={styles.sectionTitle}>• Transaction Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={{ width: "12%" }}>
              <Text style={styles.tableCellHeader}>SN</Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>Payment Type</Text>
            </View>
            <View style={{ width: "20%" }}>
              <Text style={styles.tableCellHeader}>Category</Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.tableCellHeader, ...styles.textRight }}>Opening</Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.tableCellHeader, ...styles.textRight }}>Received</Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.tableCellHeader, ...styles.textRight }}>Closing</Text>
            </View>
          </View>

          {transactionSummary.map((row, idx) => (
  <View
    key={idx}
    style={[
      styles.tableRow,
      idx % 2 === 0 ? styles.rowGray : styles.rowWhite
    ]}
  >
    <View style={{ width: "12%" }}>
      <Text style={styles.tableCell}>{idx + 1}</Text>
    </View>

    <View style={{ width: "20%" }}>
      <Text style={styles.tableCell}>{row.payment_type_name || "-"}</Text>
    </View>

    <View style={{ width: "20%" }}>
      <Text style={styles.tableCell}>{row.payment_type_category_name || "-"}</Text>
    </View>

    <View style={{ width: "16%" }}>
      <Text style={{ ...styles.tableCell, ...styles.textRight }}>
        {fmt2(row.opening_balance)}
      </Text>
    </View>

    <View style={{ width: "16%" }}>
      <Text style={{ ...styles.tableCell, ...styles.textRight }}>
        {fmt2(row.received)}
      </Text>
    </View>

    <View style={{ width: "16%" }}>
      <Text style={{ ...styles.tableCell, ...styles.textRight }}>
        {fmt2(row.closing_balance)}
      </Text>
    </View>
  </View>
))}


          {/* TOTAL ROW */}
          <View style={{ ...styles.tableRow, ...styles.totalRow }}>
            <View style={{ width: "12%" }}></View>
            <View style={{ width: "40%" }}>
              <Text style={styles.totaltableCellHeader}>Closing balance</Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.totaltableCellHeader, ...styles.textRight }}>
                {fmt2(summaryTotals.total_opening_balance)}
              </Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.totaltableCellHeader, ...styles.textRight }}>
                {fmt2(summaryTotals.total_received)}
              </Text>
            </View>
            <View style={{ width: "16%" }}>
              <Text style={{ ...styles.totaltableCellHeader, ...styles.textRight }}>
                {fmt2(summaryTotals.total_closing_balance)}
              </Text>
            </View>
          </View>
        </View>
      </>
      </Page>

     

     

     
    </Document>
  )
}
