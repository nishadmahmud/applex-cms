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
    paddingBottom: 100,
    fontSize: 10,
    fontFamily: "NotoSerifBengali",
    color: "#111",
    position: "relative",
  },

  headerTopBackground: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { width: "60%" },
  shopNameText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  shopContactText: {
    fontSize: 10,
    color: "#ffffff",
    marginBottom: 2,
    fontWeight: "bold",
  },
  headerRight: {
    width: "40%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  invoiceText: { fontSize: 24, fontWeight: "bold" },

  headerBottomStrip: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripTextLeft: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
  stripTextRight: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    paddingBottom: 10,
  },
  infoColLeft: { width: "35%", paddingRight: 5 },
  infoColCenter: { width: "35%", paddingLeft: 5, paddingRight: 5 },
  infoColRight: { width: "30%", paddingLeft: 5, textAlign: "right" },
  label: {
    fontSize: 8,
    color: "#4b5563",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  subValue: { fontSize: 9, color: "#4b5563" },

  serviceInfoRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 2,
  },
  serviceInfoCell: { width: "33.33%", paddingHorizontal: 4 },

  table: {
    marginHorizontal: 20,
    width: "auto",
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
  colNo: { width: "6%", textAlign: "center" },
  colDesc: { width: "30%", textAlign: "left" },
  colUnits: { width: "12%", textAlign: "center" },
  colTech: { width: "32%", textAlign: "left" },
  colFees: { width: "20%", textAlign: "right", borderRightWidth: 0 },

  bottomSection: {
    flexDirection: "row",
    marginHorizontal: 20,
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
  totalsCol: { width: "40%", backgroundColor: "#fff" },
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
  transDetails: { padding: 8 },
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
  grandTotal: { fontSize: 11, fontWeight: "bold" },
  amountInWords: {
    marginHorizontal: 20,
    padding: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
  },

  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  footerContentWrapper: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  footerLeft: { width: "70%", paddingRight: 20 },
  footerRight: { width: "25%", alignItems: "center" },
  tcTitle: { fontSize: 8, fontWeight: "bold", marginBottom: 4, color: "#000" },
  tcCondition: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  thanksText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 2,
  },
  sigLine: {
    borderTopWidth: 2,
    borderTopColor: "#b2b2b2",
    width: "100%",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  footerBottomStrip: { width: "100%", height: 15 },
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
  str += n[5] != 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
  return str.trim().toUpperCase();
};

const fmtMoney = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function ServiceInvoicePdf3({
  qrDataUrl,
  service,
  user,
  logoUrl,
  termsData,
  session,
}) {
  const d = service;
  const invUser = d?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const userSettings = user?.invoice_settings || {};

  const mainColor = userSettings?.first_code || invSet?.first_code || "#f97316";
  const darkColor = userSettings?.second_code || invSet?.second_code || "#111827";

  const shopName = userSettings?.shop_name || invSet?.shop_name || invUser?.outlet_name || "Shop Name";
  const shopAddress = userSettings?.shop_address || invSet?.shop_address || invUser?.address || "";
  const shopNumber =
    [invSet?.mobile_number || userSettings?.mobile_number, invSet?.additional_mobile_number || userSettings?.additional_mobile_number]
      .filter(Boolean)
      .join(" / ") || invUser?.phone || "";
  const shopEmail = invSet?.email || userSettings?.email || invUser?.email || "";

  const customer = d?.customers || {};
  const customerName = customer?.name || "Walk-in";
  const customerPhone = customer?.mobile_number || customer?.phone || "N/A";
  const customerAddress = customer?.address || "N/A";

  const invNo = d?.service_invoice_id || "";
  const dateObj = d?.created_at ? new Date(d.created_at) : null;
  const invDate = dateObj ? dateObj.toLocaleDateString("en-GB") : "";

  const items = d?.service_details || [];
  const fees = Number(d?.fees || 0);
  const vat = Number(d?.vat || 0);
  const tax = Number(d?.tax || 0);
  const discount = Number(d?.discount || 0);
  const total = Number(d?.total || 0);
  const paid = Number(d?.paid_amount || 0);
  const due = Number(d?.due_amount || 0);

  const amountInWords = total > 0 ? `${numberToWords(Math.round(total))} TAKA ONLY` : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ===== HEADER: dark background ===== */}
        <View style={[styles.headerTopBackground, { backgroundColor: darkColor }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.shopNameText, { color: mainColor }]}>{shopName}</Text>
            {shopNumber ? <Text style={styles.shopContactText}>{shopNumber}</Text> : null}
            {shopEmail ? <Text style={styles.shopContactText}>{shopEmail}</Text> : null}
            {shopAddress ? <Text style={styles.shopContactText}>{shopAddress}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.invoiceText, { color: mainColor }]}>Invoice</Text>
          </View>
        </View>

        {/* ===== ACCENT STRIP ===== */}
        <View style={[styles.headerBottomStrip, { backgroundColor: mainColor }]}>
          <Text style={styles.stripTextLeft}>Invoice No - #SERVICE-{invNo}</Text>
          <View style={{ flexDirection: "row", gap: 20 }}>
            <Text style={styles.stripTextRight}>Date</Text>
            <Text style={styles.stripTextRight}>{invDate}</Text>
          </View>
        </View>

        {/* ===== CUSTOMER INFO ===== */}
        <View style={styles.infoRow}>
          <View style={styles.infoColLeft}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customerName}</Text>
            <Text style={styles.subValue}>Contact: {customerPhone}</Text>
          </View>
          <View style={styles.infoColCenter}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{customerAddress}</Text>
          </View>
          <View style={styles.infoColRight}>
            {qrDataUrl ? (
              <Image src={qrDataUrl} style={{ width: 60, height: 60, alignSelf: "flex-end", marginBottom: 4 }} />
            ) : null}
            <Text style={{ fontSize: 9, textAlign: "right" }}>
              InvSL: # <Text style={{ fontWeight: "bold" }}>{invNo}</Text>
            </Text>
            <Text style={{ fontSize: 8, color: "#4b5563", textAlign: "right" }}>{invDate}</Text>
          </View>
        </View>

        {/* ===== SERVICE INFO ROW ===== */}
        <View style={styles.serviceInfoRow}>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.label}>Service Type</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
              {d?.service_type?.name || d?.service_type_name || `Type #${d?.service_type_id || "—"}`}
            </Text>
          </View>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.label}>Issue Description</Text>
            <Text style={{ fontSize: 9 }}>{d?.issue_description || "—"}</Text>
          </View>
          <View style={styles.serviceInfoCell}>
            <Text style={styles.label}>Checking Description</Text>
            <Text style={{ fontSize: 9 }}>{d?.checking_description || "—"}</Text>
          </View>
        </View>

        {/* ===== ITEMS TABLE ===== */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colNo]}>N°</Text>
            <Text style={[styles.th, styles.colDesc]}>Description(Code)</Text>
            <Text style={[styles.th, styles.colUnits]}>Units</Text>
            <Text style={[styles.th, styles.colTech]}>Technicians</Text>
            <Text style={[styles.th, styles.colFees, { borderRightWidth: 0 }]}>Fees</Text>
          </View>

          {items.length > 0
            ? items.map((item, i) => {
                const name = item.product_info?.name || `Product #${item.product_id}`;
                const barcode = item.product_info?.barcode;
                const techs =
                  (item.technician_list || item.technicians || [])
                    .map((t) => t.name)
                    .join(", ") || "—";

                return (
                  <View key={item.id || i} style={styles.tableRow}>
                    <Text style={[styles.td, styles.colNo]}>{i + 1}</Text>
                    <View style={[styles.td, styles.colDesc]}>
                      <Text style={{ fontWeight: "bold", marginBottom: 2 }}>{name}</Text>
                      {barcode ? (
                        <Text style={{ fontSize: 8, color: "#6b7280" }}>Barcode: {barcode}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.td, styles.colUnits]}>{item.servicing_unit ?? "—"} Pcs</Text>
                    <Text style={[styles.td, styles.colTech]}>{techs}</Text>
                    <Text style={[styles.td, styles.colFees, { borderRightWidth: 0, fontWeight: "bold" }]}>
                      {i === 0 ? fmtMoney(fees) : "—"}
                    </Text>
                  </View>
                );
              })
            : (
              <View style={styles.tableRow}>
                <Text style={[styles.td, styles.colNo]}>1</Text>
                <View style={[styles.td, styles.colDesc]}>
                  <Text style={{ fontWeight: "bold" }}>Service Charge</Text>
                </View>
                <Text style={[styles.td, styles.colUnits]}>—</Text>
                <Text style={[styles.td, styles.colTech]}>—</Text>
                <Text style={[styles.td, styles.colFees, { borderRightWidth: 0, fontWeight: "bold" }]}>
                  {fmtMoney(fees)}
                </Text>
              </View>
            )}
        </View>

        {/* ===== BOTTOM SECTION (Transaction + Totals) ===== */}
        <View style={styles.bottomSection}>
          <View style={styles.transactionCol}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            <View style={styles.transDetails}>
              {d?.multiple_payment?.length > 0 ? (
                d.multiple_payment.map((pay, i) => (
                  <View key={i} style={styles.transRow}>
                    <Text style={{ fontSize: 9 }}>
                      {pay?.payment_type?.type_name || "Payment"}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                      {fmtMoney(pay.payment_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>Cash</Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>{fmtMoney(paid)}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.totalsCol}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Service Fees</Text>
              <Text style={{ fontSize: 9 }}>{fmtMoney(fees)}</Text>
            </View>
            {vat > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>VAT</Text>
                <Text style={{ fontSize: 9 }}>(+) {fmtMoney(vat)}</Text>
              </View>
            )}
            {tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Tax / Service Charge</Text>
                <Text style={{ fontSize: 9 }}>(+) {fmtMoney(tax)}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Discount</Text>
                <Text style={{ fontSize: 9 }}>(-) {fmtMoney(discount)}</Text>
              </View>
            )}

            <View style={styles.totalRowFinal}>
              <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>Gross Total</Text>
              <Text style={styles.grandTotal}>{fmtMoney(total)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Paid Amount</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>{fmtMoney(paid)}</Text>
            </View>

            <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: due > 0 ? "#b91c1c" : "#059669",
                }}
              >
                {fmtMoney(due)}
              </Text>
            </View>
          </View>
        </View>

        {/* ===== AMOUNT IN WORDS ===== */}
        {amountInWords ? (
          <View style={styles.amountInWords}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: "#4b5563", textTransform: "uppercase", marginBottom: 2 }}>
              Amount in words
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
              {amountInWords}
            </Text>
          </View>
        ) : null}

        {/* ===== TERMS (optional, above footer) ===== */}
        {termsData?.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 9, fontWeight: "bold", textDecoration: "underline", marginBottom: 4, textTransform: "uppercase" }}>
              Terms & Conditions
            </Text>
            {termsData.map((item, idx) => (
              <View key={idx} style={{ flexDirection: "row", marginBottom: 2, fontFamily: "NotoSerifBengali" }}>
                <Text style={{ width: 8, fontSize: 9 }}>•</Text>
                <Text style={{ flex: 1, fontSize: 9 }}>{item?.description || "-"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ===== FOOTER (fixed at bottom) ===== */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerContentWrapper}>
            <View style={styles.footerLeft}>
              <Text style={styles.tcTitle}>T&C Will Apply</Text>
              <Text style={[styles.tcCondition, { color: mainColor }]}>
                Kindly make sure you've read the policies thoroughly before exiting the shop
              </Text>
              <Text style={styles.thanksText}>Thanks For Using Our Service</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.sigLine}>Authorised Signature</Text>
            </View>
          </View>
          <View style={[styles.footerBottomStrip, { backgroundColor: mainColor }]} />
        </View>

      </Page>
    </Document>
  );
}
