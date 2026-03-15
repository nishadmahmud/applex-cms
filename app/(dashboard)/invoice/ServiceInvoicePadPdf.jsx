/* eslint-disable react/prop-types */
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
import { formatBangladeshiAmount } from "@/lib/format-display-bdt";

Font.register({
  family: "NotoSerifBengali",
  fonts: [
    { src: "/fonts/NotoSerifBengali-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSerifBengali-Bold.ttf", fontWeight: "bold" },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 140,
    paddingBottom: 60,
    paddingLeft: 30,
    paddingRight: 30,
    fontSize: 10,
    fontFamily: "NotoSerifBengali",
    color: "#111",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingVertical: 5,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  infoColLeft: {
    width: "35%",
    paddingRight: 5,
  },
  infoColCenter: {
    width: "35%",
    paddingLeft: 5,
    paddingRight: 5,
  },
  infoColRight: {
    width: "30%",
    paddingLeft: 5,
    textAlign: "right",
  },
  label: {
    fontSize: 8,
    color: "#4b5563",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  subValue: {
    fontSize: 9,
    color: "#4b5563",
  },

  serviceInfoRow: {
    flexDirection: "row",
    marginBottom: 10,
    padding: 6,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 2,
  },
  serviceInfoCell: {
    width: "33%",
    paddingHorizontal: 4,
  },
  serviceInfoLabel: {
    fontSize: 7,
    color: "#6b7280",
    fontWeight: "bold",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  serviceInfoValue: {
    fontSize: 8,
    color: "#111827",
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  th: {
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  td: {
    padding: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colNo: { width: "5%", textAlign: "center" },
  colDesc: { width: "35%", textAlign: "left" },
  colUnits: { width: "10%", textAlign: "center" },
  colTech: { width: "30%", textAlign: "left" },
  colFees: { width: "20%", textAlign: "right" },

  bottomSection: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 15,
  },
  transactionCol: {
    width: "60%",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  totalsCol: {
    width: "40%",
    backgroundColor: "#fff",
  },
  sectionHeader: {
    backgroundColor: "#f3f4f6",
    padding: 5,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  transDetails: {
    padding: 8,
  },
  transRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 4,
    marginBottom: 4,
    borderRadius: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  grandTotal: {
    fontSize: 11,
    fontWeight: "bold",
  },
  amountInWords: {
    padding: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
  },
  terms: {
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  termItem: {
    fontSize: 9,
    marginBottom: 2,
    flexDirection: "row",
    fontFamily: "NotoSerifBengali",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
    marginBottom: 20,
  },
  sigBox: {
    width: "30%",
    textAlign: "center",
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    paddingTop: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  qrCode: {
    width: 70,
    height: 70,
  },
});

const numberToWords = (num) => {
  if (!num) return "";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ",
    "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ",
    "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
  str += n[5] != 0
    ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
    : "";

  return str.trim().toUpperCase();
};

const ServiceInvoicePadPdf = ({ qrDataUrl, service, user, logoUrl, termsData, session }) => {
  const d = service;
  const customer = d?.customers || {};
  const items = d?.service_details || d?.service_products || [];
  const fees = Number(d?.fees || 0);
  const vat = Number(d?.vat || 0);
  const tax = Number(d?.tax || 0);
  const discount = Number(d?.discount || 0);
  const total = Number(d?.total || 0);
  const paid = Number(d?.paid_amount || 0);
  const due = Number(d?.due_amount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER TITLE */}
        <Text style={styles.headerTitle}>Service Invoice</Text>

        {/* INFO ROW */}
        <View style={styles.infoRow}>
          <View style={styles.infoColLeft}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customer?.name || "Walk-in"}</Text>
            <Text style={styles.subValue}>
              Contact: {customer?.mobile_number || customer?.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.infoColCenter}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{customer?.address || "N/A"}</Text>
          </View>

          <View style={styles.infoColRight}>
            <Text style={{ fontSize: 9 }}>
              Service ID: <Text style={{ fontWeight: "bold" }}>{d?.service_invoice_id || "N/A"}</Text>
            </Text>
            <Text style={{ fontSize: 9 }}>
              InvSL: # <Text style={{ fontWeight: "bold" }}>{d?.id || "N/A"}</Text>
            </Text>
            <Text style={{ fontSize: 9 }}>
              Date:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {d?.created_at
                  ? new Date(d.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </Text>
            </Text>
          </View>
        </View>

        {/* SERVICE INFO ROW */}
        <View style={styles.serviceInfoRow}>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.serviceInfoLabel}>Service Type</Text>
            <Text style={styles.serviceInfoValue}>
              {d?.service_type?.name || d?.service_type_name || `Type #${d?.service_type_id || "—"}`}
            </Text>
          </View>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.serviceInfoLabel}>Issue Description</Text>
            <Text style={styles.serviceInfoValue}>{d?.issue_description || "—"}</Text>
          </View>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.serviceInfoLabel}>Checking Description</Text>
            <Text style={styles.serviceInfoValue}>{d?.checking_description || "—"}</Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colNo]}>N°</Text>
            <Text style={[styles.th, styles.colDesc]}>Description(Code)</Text>
            <Text style={[styles.th, styles.colUnits]}>Units</Text>
            <Text style={[styles.th, styles.colTech]}>Technicians</Text>
            <Text style={[styles.th, styles.colFees, { borderRightWidth: 0 }]}>Fees</Text>
          </View>

          {items.map((item, i) => {
            const name = item.product_info?.name || `Product #${item.product_id}`;
            const barcode = item.product_info?.barcode;
            const techs =
              (item.technician_list || item.technicians || [])
                .map((t) => t.name)
                .join(", ") || "—";

            return (
              <View style={styles.tableRow} key={item.id || i}>
                <Text style={[styles.td, styles.colNo]}>{i + 1}</Text>
                <View style={[styles.td, styles.colDesc]}>
                  <Text style={{ fontWeight: "bold", marginBottom: 2 }}>{name}</Text>
                  {barcode && (
                    <Text style={{ fontSize: 8, color: "#6b7280" }}>Barcode: {barcode}</Text>
                  )}
                </View>
                <Text style={[styles.td, styles.colUnits]}>{item.servicing_unit} Pcs</Text>
                <Text style={[styles.td, styles.colTech]}>{techs}</Text>
                <Text style={[styles.td, styles.colFees, { borderRightWidth: 0, fontWeight: i === 0 ? "bold" : "normal" }]}>
                  {i === 0 ? formatBangladeshiAmount(fees) : "—"}
                </Text>
              </View>
            );
          })}

          {items.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.td, styles.colNo]}>1</Text>
              <View style={[styles.td, styles.colDesc]}>
                <Text style={{ fontWeight: "bold" }}>Service Charge</Text>
              </View>
              <Text style={[styles.td, styles.colUnits]}>—</Text>
              <Text style={[styles.td, styles.colTech]}>—</Text>
              <Text style={[styles.td, styles.colFees, { borderRightWidth: 0, fontWeight: "bold" }]}>
                {formatBangladeshiAmount(fees)}
              </Text>
            </View>
          )}
        </View>

        {/* BOTTOM SECTION */}
        <View style={styles.bottomSection}>
          {/* Left: Transaction Details */}
          <View style={styles.transactionCol}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            <View style={styles.transDetails}>
              {d?.multiple_payment?.length > 0 ? (
                d.multiple_payment.map((pay, i) => (
                  <View key={i} style={styles.transRow}>
                    <Text style={{ fontSize: 9 }}>{pay?.payment_type?.type_name || "Payment"}</Text>
                    <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                      {formatBangladeshiAmount(pay.payment_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>Cash</Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {formatBangladeshiAmount(paid)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right: Totals */}
          <View style={styles.totalsCol}>
            {vat > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>VAT</Text>
                <Text style={{ fontSize: 9 }}>{formatBangladeshiAmount(vat)}</Text>
              </View>
            )}
            {tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Service Charge</Text>
                <Text style={{ fontSize: 9 }}>{formatBangladeshiAmount(tax)}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Discount</Text>
                <Text style={{ fontSize: 9 }}>(-){formatBangladeshiAmount(discount)}</Text>
              </View>
            )}

            <View style={styles.totalRowFinal}>
              <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>Gross Total</Text>
              <Text style={styles.grandTotal}>{formatBangladeshiAmount(total)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Paid Amount</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>{formatBangladeshiAmount(paid)}</Text>
            </View>

            <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: due > 0 ? "#b91c1c" : "#059669" }}>
                {formatBangladeshiAmount(due)}
              </Text>
            </View>
          </View>
        </View>

        {/* AMOUNT IN WORDS */}
        <View style={styles.amountInWords}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: "#4b5563", textTransform: "uppercase", marginBottom: 2 }}>
            Amount in words
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
            {numberToWords(Math.round(total))} TAKA ONLY
          </Text>
        </View>

        {/* TERMS & CONDITIONS */}
        {termsData && termsData.length > 0 && (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            {termsData.map((t, i) => (
              <View key={i} style={styles.termItem}>
                <Text style={{ marginRight: 4 }}>•</Text>
                <Text>{t.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SIGNATURES */}
        <View style={styles.signatureSection}>
          <View style={styles.sigBox}>
            <Text style={styles.sigLine}>Customer Signature</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCode} />}
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.sigLine}>Authorized Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ServiceInvoicePadPdf;
