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
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#2b89c3", // bluish header from reference
        padding: 6,
        justifyContent: "center",
    },
    tableColHeaderTop: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#2b89c3",
        padding: 4,
        justifyContent: "center",
    },
    tableColHeaderSub: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#2b89c3",
        padding: 4,
        justifyContent: "center",
    },
    tableCol: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 4,
        justifyContent: "center",
    },

    tableCellHeaderTop: { fontSize: 8, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
    tableCellHeader: { fontSize: 8, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
    tableCellHeaderLeft: { fontSize: 8, fontWeight: "bold", color: "#FFFFFF", textAlign: "left" },
    tableCell: { fontSize: 8, color: "#111827", textAlign: "center" },
    tableCellLeft: { fontSize: 8, color: "#111827", textAlign: "left" },

    summaryRow: { backgroundColor: "#F9FAFB", fontWeight: "bold" },
    summaryCell: { fontSize: 9, fontWeight: "bold", color: "#111827", textAlign: "center" },
    summaryCellLeft: { fontSize: 9, fontWeight: "bold", color: "#111827", textAlign: "right", paddingRight: 8 },

    // Columns dimensions (flat structure)
    slCol: { width: "8%" },
    itemCol: { width: "50%" },
    stockCol: { width: "14%" },

    pageNum: {
        position: "absolute",
        fontSize: 7,
        bottom: 8,
        right: 14,
        color: "#6B7280",
    },
});

function InventorySummaryPdf({ data = [], filters, user }) {
    // 1. Flatten all rows from data
    const allRows = data.flatMap((group) => group.rows);

    // 2. Helper to get full product title with variations
    const formatStorage = (s) => {
        if (s == null || s === "") return "";
        if (!isNaN(Number(s))) return `${Number(s)} GB`;
        const normalized = String(s).trim();
        const match = normalized.match(/^(\d+)\s*gb$/i);
        if (match) return `${match[1]} GB`;
        return normalized;
    };

    const buildProductTitle = (r) => {
        return r.productName || "";
    };

    // 3. Group rows
    const summaryMap = new Map();
    let totalIn = 0;
    let totalOut = 0;
    let totalAvailable = 0;

    allRows.forEach((row) => {
        const title = buildProductTitle(row);
        if (!summaryMap.has(title)) {
            summaryMap.set(title, {
                itemName: title,
                in: 0,
                out: 0,
                available: 0,
            });
        }
        const item = summaryMap.get(title);

        item.in += 1;
        totalIn += 1;

        if (row.inStock === 1) {
            item.available += 1;
            totalAvailable += 1;
        } else {
            item.out += 1;
            totalOut += 1;
        }
    });

    const summaryList = Array.from(summaryMap.values()).sort((a, b) =>
        a.itemName.localeCompare(b.itemName)
    );

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>
                <StandardReportHeader
                    user={user}
                    title="INVENTORY SUMMARY"
                    reportLabel="Inventory Summary"
                    filters={filters}
                    logoUrl={
                        user?.invoice_settings?.shop_logo
                            ? `/api/logo-proxy?url=${encodeURIComponent(
                                user.invoice_settings.shop_logo
                            )}`
                            : null
                    }
                    extraInfo={
                        <Text style={{ fontSize: 8, color: "#374151" }}>
                            Total Items: {totalIn}
                        </Text>
                    }
                />

                <View style={styles.table}>
                    {/* Header Row */}

                    <View style={styles.tableRow}>
                        {/* Spanning Row for STOCK DETAILS */}
                        {/* Left blank spaces for SN and ITEM NAME which we will render below using absolute/flex hacking, OR we split headers cleanly */}
                        <View style={[styles.tableColHeaderTop, { width: "58%", borderRightWidth: 0, backgroundColor: "#FFFFFF" }]}>
                            {/* Empty to make room for SN and ITEM NAME */}
                        </View>
                        <View style={[styles.tableColHeaderTop, { width: "42%", borderRightWidth: 1, borderRightColor: "#000", borderBottomColor: "#000", padding: 3 }]}>
                            <Text style={styles.tableCellHeaderTop}>STOCK DETAILS</Text>
                        </View>
                    </View>

                    <View style={[styles.tableRow, { marginTop: -16 }]}>
                        {/* SN */}
                        <View style={[styles.tableColHeader, styles.slCol, { paddingTop: 16 }]}>
                            <Text style={styles.tableCellHeader}>SN</Text>
                        </View>

                        {/* ITEM NAME */}
                        <View style={[styles.tableColHeader, styles.itemCol, { alignItems: "flex-start", paddingLeft: 8, paddingTop: 16 }]}>
                            <Text style={styles.tableCellHeaderLeft}>ITEM NAME</Text>
                        </View>

                        {/* IN */}
                        <View style={[styles.tableColHeaderSub, styles.stockCol]}>
                            <Text style={styles.tableCellHeader}>IN</Text>
                        </View>
                        {/* OUT */}
                        <View style={[styles.tableColHeaderSub, styles.stockCol]}>
                            <Text style={styles.tableCellHeader}>OUT</Text>
                        </View>
                        {/* AVAILABLE */}
                        <View style={[styles.tableColHeaderSub, styles.stockCol, { borderRightWidth: 1, borderRightColor: "#000" }]}>
                            <Text style={styles.tableCellHeader}>AVAILABLE</Text>
                        </View>
                    </View>

                    {/* Rows */}
                    {summaryList.map((item, idx) => (
                        <View style={styles.tableRow} key={`row-${idx}`}>
                            <View style={[styles.tableCol, styles.slCol]}>
                                <Text style={styles.tableCell}>{idx + 1}</Text>
                            </View>

                            <View style={[styles.tableCol, styles.itemCol, { alignItems: "flex-start", paddingLeft: 8 }]}>
                                <Text style={styles.tableCellLeft}>{item.itemName}</Text>
                            </View>

                            <View style={[styles.tableCol, styles.stockCol]}>
                                <Text style={styles.tableCell}>{item.in}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.stockCol]}>
                                <Text style={styles.tableCell}>{item.out}</Text>
                            </View>
                            <View style={[styles.tableCol, styles.stockCol, { borderRightWidth: 1, borderRightColor: "#000" }]}>
                                <Text style={styles.tableCell}>{item.available}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Totals Row */}
                    <View style={[styles.tableRow, styles.summaryRow]}>
                        <View style={[styles.tableCol, { width: "58%" }]}>
                            <Text style={styles.summaryCellLeft}>Total :</Text>
                        </View>
                        <View style={[styles.tableCol, styles.stockCol]}>
                            <Text style={styles.summaryCell}>{totalIn}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.stockCol]}>
                            <Text style={styles.summaryCell}>{totalOut}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.stockCol, { borderRightWidth: 1, borderRightColor: "#000" }]}>
                            <Text style={styles.summaryCell}>{totalAvailable}</Text>
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

export default InventorySummaryPdf;
