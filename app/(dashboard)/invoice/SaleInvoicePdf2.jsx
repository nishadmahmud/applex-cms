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
// REGISTER BANGLA FONT
Font.register({
  family: "NotoSerifBengali",
  fonts: [
    { src: "/fonts/NotoSerifBengali-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSerifBengali-Bold.ttf", fontWeight: "bold" },
  ],
});
import { formatBangladeshiAmount } from "@/lib/format-display-bdt";

// Avoid hyphenation/splitting
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 35,
    paddingBottom: 40,
    fontSize: 8,
    color: "#111827",
    fontFamily: "NotoSerifBengali",
  },

  // ----- HEADER CARD -----
  headerCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomRightRadius: "5rem",
    borderBottomLeftRadius: "5rem",
  },
  headerTopStrip: {
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
  },
  headerLeft: {
    width: "40%",
    paddingRight: 6,
  },
  headerCenter: {
    width: "20%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerRight: {
    width: "40%",
    paddingLeft: 6,
    alignItems: "flex-end",
  },

  headerBrandTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 3,
  },
  headerLine: {
    fontSize: 8,
    marginBottom: 3,
    color: "#111827",
  },
  headerLabel: {
    fontWeight: "bold",
  },

  qrWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },

  shopName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  shopLine: {
    fontSize: 8,
    marginBottom: 3,
    color: "#111827",
  },

  headerBottomRow: {
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  barcodeImage: {
    width: 180,
    height: 10,
    objectFit: "contain",
  },
  barcodeText: {
    fontSize: 7,
    color: "#374151",
  },

  // ----- TABLE -----
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 10,
    marginHorizontal: 10,
  },

  tableHeaderRow: {
    flexDirection: "row",
  },
  th: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  thLast: {
    borderRightWidth: 0,
  },
  tdRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  td: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 8,
    color: "#111827",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  tdLast: {
    borderRightWidth: 0,
  },
  tdProductName: {
    fontSize: 9,
    marginBottom: 2,
  },
  tdImei: {
    fontSize: 8,
    color: "#4B5563",
  },
  rightAlign: {
    textAlign: "right",
  },

  colProduct: { width: "55%" },
  colPrice: { width: "15%" },
  colQty: { width: "10%" },
  colSubtotal: { width: "20%" },

  // ----- MIDDLE SECTION (TERMS + TOTALS) -----
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  termsCol: {
    width: 400,
    paddingHorizontal: 20,
    fontFamily: "NotoSerifBengali",
  },
  totalsCol: {
    width: 220,
    paddingHorizontal: 20,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },

  bulletDot: {
    width: 8,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    color: "#111827",
  },
  iveryBox: {
    marginTop: 6,
  },

  deliveryTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  drow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
    marginBottom: 2,
  },
  label: {
    fontWeight: "bold",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  deliveryBox: {
    marginTop: 6,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignContent: "flex-end",
    alignItems: "flex-end",
  },
  totalsLabel: {
    fontSize: 8,
    color: "#111827",
  },
  totalsValue: {
    fontSize: 8,
    color: "#111827",
    textAlign: "right",
  },
  totalsLabelStrong: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
  },
  totalsValueStrong: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  totalsValueRed: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#B91C1C",
    textAlign: "right",
  },

  noteText: {
    marginTop: 10,
    fontSize: 7,
    color: "#4B5563",
    textAlign: "center",
  },

  // ----- FOOTER BAR -----
  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 35,
    fontWeight: 600,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  footerBarText: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 25,
    fontWeight: 500,
    textAlign: "center",
    textDecoration: "center",
    paddingHorizontal: 60,
    color: "#595959",
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  footerCol: {
    flex: 1,
  },
  footerText: {
    fontSize: 8,
    color: "#111827",
  },
  footerTextCenter: {
    fontSize: 8,
    textAlign: "center",
    color: "#111827",
  },
  footerTextRight: {
    fontSize: 8,
    textAlign: "right",
    color: "#111827",
  },

  pageNum: {
    position: "absolute",
    fontSize: 7,
    bottom: 2,
    right: 20,
    color: "#6B7280",
  },
  logoImage: {
    objectFit: "contain",
    width: 130, // increased from 80
  },
  logoImageContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "0%",
    width: "100%",
    textAlign: "center",
    opacity: 0.5,
    fontSize: 120,
    transform: "rotate(-45deg)",
    zIndex: -10,
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    elevation: 99,
  },
  imageWatermark: {
    width: "80%",
    opacity: 0.2,
    objectFit: "contain",
  },

  //   new hader
  headerWrapper: {
    width: "100%",
    height: 90,
    position: "relative",
    marginBottom: 2,
    marginTop: -35,
  },

  headerBase: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 20,
  },

  headerAngle: {
    position: "absolute",
    right: -80,
    top: 0,
    width: 450,
    height: "100%",
    backgroundColor: "#ffffff",
    transform: "skewX(35deg)",
  },

  /* LEFT (Logo) */
  headerLeft2: {
    position: "absolute",
    left: 24,
    top: 0,
    height: "100%",
    justifyContent: "center",
    zIndex: 5,
  },

  logo: {
    width: 90, // increased from 60
    objectFit: "contain",
  },

  /* RIGHT (Shop Info inside angle) */
  headerRight2: {
    position: "absolute",
    right: 30,
    top: 20,
    width: 220, // REQUIRED for right alignment
    zIndex: 0,
  },

  shopRowRight: {
    flexDirection: "row", // normal row
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },

  shopIcon: {
    width: 12,
    height: 12,
    zIndex: 20,
    marginLeft: 6, // space between text and icon
  },

  shopText: {
    fontSize: 10,
    color: "#111827",
    textAlign: "right",
    maxWidth: 180,
    zIndex: 20,
  },

  shopSubRight: {
    fontSize: 10,
    zIndex: 20,
    color: "#374151",
    marginTop: 2,
  },

  // customer header

  container: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  titleRow: {
    alignItems: "center",
    marginBottom: 12,

    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#BDBDBD",
    borderBottomColor: "#BDBDBD",
    paddingVertical: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  colLeft: {
    width: "40%",
  },

  colMiddle: {
    width: "25%",
  },

  colRight: {
    width: "35%",
    alignItems: "flex-end",
  },

  labelc: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },

  value: {
    fontSize: 9,
    marginBottom: 2,
  },

  valueBold: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },

  valueRight: {
    fontSize: 9,
    marginBottom: 2,
    textAlign: "right",
  },

  barcode: {
    width: 120,
    height: 30,
    marginBottom: 6,
  },

  invTbl_table: {
    marginHorizontal: 20,
    border: "1px solid #444",
    fontSize: 9,
    marginTop: 8,
  },

  invTbl_row: {
    flexDirection: "row",
    borderBottom: "1px solid #444",
    minHeight: 16,
  },

  invTbl_header: {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
  },

  invTbl_no: {
    width: "6%",
    borderRight: "1px solid #444",
    textAlign: "center",
    padding: 2,
  },

  invTbl_desc: {
    width: "44%",
    borderRight: "1px solid #444",
    padding: 2,
  },

  invTbl_price: {
    width: "14%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 2,
  },

  invTbl_qty: {
    width: "10%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 2,
  },

  invTbl_dis: {
    width: "10%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 2,
  },

  invTbl_total: {
    width: "16%",
    textAlign: "right",
    padding: 2,
  },

  invTbl_name: {
    fontWeight: "bold",
  },

  invTbl_imei: {
    fontSize: 8,
    marginTop: 2,
  },

  // Bottom Section (Transaction + Totals) - Synced with Pad PDF
  bottomSection: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 15,
    marginTop: 10,
  },
  transactionCol: {
    width: "60%",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    backgroundColor: "transparent",
  },
  totalsCol: {
    width: "40%",
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 4,
    marginBottom: 4,
    borderRadius: 2,
  },
  // Totals Rows
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

  sectionHeaderPad: {
    backgroundColor: "#F3F4F6",
    padding: 5,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },

  invTbl_sumLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  invTbl_bold: {
    fontWeight: "bold",
  },

  // new footer

  footerRoot: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },

  footerGreenBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
  },

  footerOrangeBand: {
    position: "absolute",
    bottom: 8,
    left: 40,
    right: 40,
    height: 16,
    transform: "skewX(-12deg)",
    justifyContent: "center",
    alignItems: "center",
  },

  footerWebsiteText: {
    transform: "skewX(12deg)", // counter skew for text
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0E6B57",
    letterSpacing: 1.5,
    textTransform: "lowercase",
  },

  // header bottom border
  wrapper: {
    position: "relative",
    width: "100%",
    height: 18,
  },

  leftLine: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 4,
    width: "40%",
  },

  rightLine: {
    position: "absolute",
    right: 0,
    top: 0,
    height: 4,
    width: "75%",
  },

  rightAngle: {
    position: "absolute",
    right: -10,
    top: 6,
    bottom: 8,
    width: 150,
    height: 18,
    transform: "skewX(35deg)",

    /*
      Fake angle using border trick
      This creates a diagonal cut
    */
    borderLeftWidth: 20,
    borderLeftColor: "#ffffff",
  },

  // ----- PAD-STYLE EXTRA SECTIONS -----
  amountInWordsBox: {
    marginTop: 8,
    marginHorizontal: 20,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  amountLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#4B5563",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  signatureSectionPad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    marginHorizontal: 40,
    marginBottom: 10,
  },
  sigBoxPad: {
    width: "30%",
    textAlign: "center",
  },
  sigLinePad: {
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
    paddingTop: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  qrCodePad: {
    width: 50,
    height: 50,
  },
});

// Number to words (used for Amount in words – same logic as pad PDF)
const numberToWords = (num) => {
  if (!num) return "";
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`) + "Lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`) + "Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str !== "" ? "and " : "") +
      (a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`)
      : "";

  return str.trim().toUpperCase();
};

function Header({ brandDark, logoUrl, invoice, user, isDizmo }) {
  const shopAddress = invoice?.data.user_info?.address || "N/A";
  const shopEmail =
    user?.invoice_settings?.email || invoice?.data.user_info?.email || "N/A";
  const invSettings = user?.invoice_settings || invoice?.data?.user_info?.invoice_settings || {};
  const shopNumber =
    [
      invSettings?.mobile_number,
      invSettings?.additional_mobile_number
    ].filter(Boolean).join(" / ") ||
    user?.phone ||
    invoice?.data?.user_info?.phone ||
    "N/A";
  const brandLight =
    invoice?.data.user_info?.invoice_settings.first_code || "#b5b5b5";

  const logo = logoUrl || null;

  return (
    <>
      <View style={styles.headerWrapper}>
        {/* Base green background */}
        <View style={[styles.headerBase, { backgroundColor: brandDark }]} />

        {/* Angled white section */}
        <View style={styles.headerAngle} />

        {/* Left content (logo) */}
        {isDizmo ? (
          // 🏪 Dizmo: logo fills the entire left colored section
          <Image
            src={
              logo ||
              "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
            }
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 230,   // covers the full left dark area (headerWrapper is 100% = ~595pt A4; angled white starts ~60% from right, so left 40% ≈ 238pt)
              height: 90,   // full header height
              objectFit: "cover",
            }}
          />
        ) : (
          <View style={styles.headerLeft2}>
            <Image
              src={
                logo ||
                "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
              }
              style={styles.logo}
            />
          </View>
        )}

        {/* Right content (inside angle) */}
        <View style={styles.headerRight2}>
          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopNumber}</Text>
            <Image
              src="https://cdn-icons-png.flaticon.com/512/724/724664.png"
              style={styles.shopIcon}
            />
          </View>

          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopEmail}</Text>
            <Image
              src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
              style={styles.shopIcon}
            />
          </View>

          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopAddress}</Text>
            <Image
              src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
              style={styles.shopIcon}
            />
          </View>
        </View>
      </View>
      <View style={styles.wrapper}>
        {/* Left green line */}
        <View style={[styles.leftLine, { backgroundColor: brandDark }]} />

        {/* Right orange line */}
        <View style={[styles.rightLine, { backgroundColor: brandLight }]} />

        {/* Right angled shape */}
        <View style={[styles.rightAngle, { backgroundColor: brandLight }]} />
      </View>
    </>
  );
}

function CustomerInfo({ invoice, barcodeImage }) {
  const customer = invoice.data;
  return (
    <View style={styles.container}>
      {/* TITLE */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>SALES INVOICE</Text>
      </View>

      {/* MAIN HEADER ROW */}
      <View style={styles.row}>
        {/* LEFT – CUSTOMER */}
        <View style={styles.colLeft}>
          <Text style={styles.labelc}>Customer</Text>

          <Text style={styles.valueBold}>{customer.customer_name || "-"}</Text>

          <Text style={styles.value}>
            Contact: {customer.customer_phone || "-"}
          </Text>
        </View>

        {/* MIDDLE – ADDRESS */}
        <View style={styles.colMiddle}>
          <Text style={styles.labelc}>Address</Text>

          <Text style={styles.value}>{customer.customer_address || "-"}</Text>
        </View>

        {/* RIGHT – INVOICE INFO */}
        <View style={styles.colRight}>
          {/* BARCODE */}
          {barcodeImage && (
            <Image src={barcodeImage} style={styles.barcode} />
          )}

          <Text style={styles.valueRight}>
            {invoice?.data.custom_invoice_id || "-"}
          </Text>

          {/* ✅ Show Parcel (Consignment) ID only if available */}
          {invoice?.data?.stead_fast_courier?.consignment_id ? (
            <Text style={styles.valueRight}>
              <Text style={{ fontWeight: "bold" }}>Parcel ID: </Text>
              {invoice.data.stead_fast_courier.consignment_id}
            </Text>
          ) : null}

          <Text style={styles.valueRight}>
            Date:{" "}
            {invoice?.data?.created_at
              ? new Date(invoice.data.created_at).toLocaleDateString()
              : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ItemsTable({ invoice }) {
  const invUser = invoice?.data?.user_info || {};
  const invSet = invUser.invoice_settings || {};

  const items = invoice?.data?.sales_details || [];
  const exchangeImeis = invoice?.data?.exchange_imeis || [];

  const subTotal = Number(invoice?.data?.sub_total ?? 0);
  const discount = Number(invoice?.data?.discount ?? 0);
  const deliveryFee = Number(invoice?.data?.delivery_fee ?? 0);
  const vatPercent = Number(invSet.vat ?? invoice?.data?.vat ?? 0);
  const vatAmount = ((subTotal - discount) * vatPercent) / 100;
  const exchangeTotal = exchangeImeis.reduce(
    (sum, ex) => sum + Number(ex?.purchase_price || 0),
    0,
  );

  const adjustedSubTotal =
    exchangeTotal > 0 ? subTotal - exchangeTotal : subTotal;
  // --------------------------------------
  // ✅ Cash Change Logic (same as SaleInvoice)
  // --------------------------------------
  const totalAmount = adjustedSubTotal - discount + vatAmount + deliveryFee;
  const paidAmount = Number(invoice?.data?.paid_amount ?? 0);

  const rawChange = invoice?.data?.cash_change;
  const hasChange =
    rawChange !== null &&
    rawChange !== undefined &&
    rawChange !== "" &&
    Number(rawChange) > 0;

  const changeAmount = hasChange ? Number(rawChange) : 0;
  // If customer overpaid → due = 0, else normal formula
  const dueAmount = hasChange ? 0 : Math.max(totalAmount - paidAmount, 0);

  // Pad-style totals for PDF body (align with SaleInvoicePadPdf)
  const padFinalTotal =
    adjustedSubTotal - discount + vatAmount + deliveryFee;
  const padEffectivePaid =
    changeAmount > 0 ? padFinalTotal : paidAmount;
  const padEffectiveDue =
    changeAmount > 0 ? 0 : Math.max(padFinalTotal - padEffectivePaid, 0);

  return (
    <View style={styles.invTbl_table}>
      {/* HEADER */}
      <View style={[styles.invTbl_row, styles.invTbl_header]}>
        <Text style={styles.invTbl_no}>No</Text>
        <Text style={styles.invTbl_desc}>Description (Code)</Text>
        <Text style={styles.invTbl_price}>Price</Text>
        <Text style={styles.invTbl_qty}>Qty</Text>
        <Text style={styles.invTbl_dis}>Dis</Text>
        <Text style={styles.invTbl_total}>Total</Text>
      </View>

      {/* ITEMS */}
      {items.map((item, index) => {
        let name = item?.product_info?.name || item?.product_name || "Product";

        // handle variant names
        if (
          item?.product_info?.have_product_variant ||
          item?.have_product_variant ||
          item?.product_variant
        ) {
          const variantName = item?.product_variant?.name;
          if (variantName) name += ` - ${variantName}`;
        }

        // ✅ NEW: Default Warranty (Moved to end)
        const defWarranties = invoice?.data?.defaultwarranties;
        let warrantyName = "";
        if (Array.isArray(defWarranties)) {
          const wItem = defWarranties.find((w) => w.product_id === item.product_id);
          if (wItem?.warranty?.name) {
            warrantyName = wItem.warranty.name;
          }
        }

        // 🧹 Clean warranty from name if already exists (API might send it)
        if (warrantyName) {
          const pattern = `(${warrantyName})`;
          if (name.includes(pattern)) {
            name = name.replace(pattern, "").trim();
          } else if (name.includes(warrantyName)) {
            name = name.replace(warrantyName, "").trim();
          }
        }

        // ✅ Append IMEI specs (Color, Storage, Region)
        const imeiData = item?.product_imei;
        if (Array.isArray(imeiData) && imeiData.length > 0) {
          const first = imeiData[0];
          const parts = [];
          if (first.color) parts.push(`Color: ${first.color}`);
          if (first.storage) parts.push(`Storage: ${first.storage}`);
          if (first.region) parts.push(`Region: ${first.region}`);
          if (parts.length > 0) name += ` (${parts.join(" | ")})`;
        }

        // ✅ Append Warranty at the END
        if (warrantyName) {
          name += ` (${warrantyName})`;
        }

        const imeis = (item?.product_imei || [])
          .map((i) => i.imei)
          .filter(Boolean)
          .join(", ");

        const price = Number(item?.price ?? item?.sale_price ?? 0);
        const qty = Number(item?.qty ?? 0);
        const lineTotal = price * qty;

        return (
          <View key={index} style={styles.invTbl_row}>
            <Text style={styles.invTbl_no}>{index + 1}</Text>

            <View style={styles.invTbl_desc}>
              <Text style={styles.invTbl_name}>{name}</Text>
              {imeis ? (
                <Text style={styles.invTbl_imei}>IMEI# {imeis}</Text>
              ) : item?.product_info?.barcode ? (
                <Text style={styles.invTbl_imei}>
                  Barcode: {item.product_info.barcode}
                </Text>
              ) : null}
            </View>

            <Text style={styles.invTbl_price}>
              {formatBangladeshiAmount(price)}
            </Text>
            <Text style={styles.invTbl_qty}>{qty.toFixed(2)} Pcs</Text>
            <Text style={styles.invTbl_dis}>-</Text>
            <Text style={styles.invTbl_total}>
              {formatBangladeshiAmount(lineTotal)}
            </Text>
          </View>
        );
      })}

      {/* ✅ Exchange products (only if exist) */}
      {Array.isArray(exchangeImeis) &&
        exchangeImeis.length > 0 &&
        exchangeImeis.map((ex, index) => (
          <View
            key={`exchange-${ex.id}`}
            style={[
              styles.invTbl_row,
              { backgroundColor: "#FEE2E2" }, // red tint
            ]}
          >
            <Text style={[styles.invTbl_no, { color: "#B91C1C" }]}>
              {items.length + index + 1}
            </Text>

            <View style={styles.invTbl_desc}>
              <Text
                style={[
                  styles.invTbl_name,
                  { color: "#B91C1C", fontWeight: "bold" },
                ]}
              >
                {ex.product_name}
              </Text>

              {/* ✅ IMEI line just like Design 1 */}
              {ex.imei && (
                <Text style={[styles.invTbl_imei, { color: "#DC2626" }]}>
                  IMEI# {ex.imei} (Exchanged Product)
                </Text>
              )}
            </View>

            <Text style={[styles.invTbl_price, { color: "#B91C1C" }]}>
              {formatBangladeshiAmount(ex.purchase_price || 0)}
            </Text>

            <Text style={[styles.invTbl_qty, { color: "#B91C1C" }]}>1</Text>

            <Text style={[styles.invTbl_dis, { color: "#B91C1C" }]}>-</Text>

            <Text style={[styles.invTbl_total, { color: "#B91C1C" }]}>
              (-) {formatBangladeshiAmount(ex.purchase_price || 0)}
            </Text>
          </View>
        ))}

      {/* SUMMARY ROW – Synced with SaleInvoicePadPdf */}
      <View style={styles.bottomSection}>
        {/* Left: Transaction Details */}
        <View style={styles.transactionCol}>
          <Text style={styles.sectionHeader}>Transaction Details</Text>
          <View style={styles.transDetails}>
            {invoice?.data?.multiple_payment?.length > 0 ? (
              invoice.data.multiple_payment.map((pay, i) => (
                <View key={i} style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>{pay?.payment_type?.type_name || "Payment"}</Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {formatBangladeshiAmount(pay.payment_amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.transRow}>
                <Text style={{ fontSize: 9 }}>{invoice?.data?.pay_mode || "Cash"}</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  {formatBangladeshiAmount(padEffectivePaid)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Totals */}
        <View style={styles.totalsCol}>
          {vatAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>VAT</Text>
              <Text style={{ fontSize: 9 }}>
                {formatBangladeshiAmount(vatAmount)}
              </Text>
            </View>
          )}
          {deliveryFee > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Delivery</Text>
              <Text style={{ fontSize: 9 }}>
                {formatBangladeshiAmount(deliveryFee)}
              </Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Discount</Text>
              <Text style={{ fontSize: 9 }}>
                (-){formatBangladeshiAmount(discount)}
              </Text>
            </View>
          )}

          <View style={styles.totalRowFinal}>
            <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>Gross Total</Text>
            <Text style={styles.grandTotal}>
              {formatBangladeshiAmount(padFinalTotal)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Paid Amount</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
              {formatBangladeshiAmount(padEffectivePaid)}
            </Text>
          </View>

          <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: padEffectiveDue > 0 ? "#b91c1c" : "#059669" }}>
              {formatBangladeshiAmount(padEffectiveDue)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MiddleSection({ invoice, termsData, qrDataUrl }) {
  // Re-compute pad final total for amount-in-words
  const invUser = invoice?.data?.user_info || {};
  const invSet = invUser.invoice_settings || {};

  const subTotal = Number(invoice?.data?.sub_total ?? 0);
  const discount = Number(invoice?.data?.discount ?? 0);
  const deliveryFee = Number(invoice?.data?.delivery_fee ?? 0);
  const vatPercent = Number(invSet.vat ?? invoice?.data?.vat ?? 0);
  const vatAmount = ((subTotal - discount) * vatPercent) / 100;

  const exchangeImeis = invoice?.data?.exchange_imeis || [];
  const exchangeTotal = exchangeImeis.reduce(
    (sum, ex) => sum + Number(ex?.purchase_price || 0),
    0,
  );

  const adjustedSubTotal =
    exchangeTotal > 0 ? subTotal - exchangeTotal : subTotal;
  const padFinalTotal =
    adjustedSubTotal - discount + vatAmount + deliveryFee;

  const amountWords =
    padFinalTotal > 0
      ? `${numberToWords(Math.round(padFinalTotal))} TAKA ONLY`
      : "";

  return (
    <>
      {/* Amount in words */}
      <View style={styles.amountInWordsBox}>
        <Text style={styles.amountLabel}>Amount in words</Text>
        <Text style={styles.amountValue}>{amountWords}</Text>
      </View>

      {/* Terms & Conditions */}
      <View style={styles.middleRow}>
        <View style={styles.termsCol}>
          <Text style={styles.termsTitle}>Terms & Condition</Text>
          {termsData.map((t, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{t.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Signatures + QR */}
      <View style={styles.signatureSectionPad} wrap={false}>
        <View style={styles.sigBoxPad}>
          <Text style={styles.sigLinePad}>Customer Signature</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          {qrDataUrl && <Image src={qrDataUrl} style={styles.qrCodePad} />}
        </View>
        <View style={styles.sigBoxPad}>
          <Text style={styles.sigLinePad}>Authorized Signature</Text>
        </View>
      </View>
    </>
  );
}

function FooterBar({ invoice }) {
  const invUser = invoice?.data?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const brandDark = invUser?.invoice_settings.second_code || "#4d4d4d";
  const brandLight = invUser?.invoice_settings.first_code || "#adadad";

  const website = invUser.web_address || invSet.web_address || "";

  return (
    <View style={styles.footerRoot} fixed>
      {/* Green Base Bar */}
      <View style={[styles.footerGreenBar, { backgroundColor: brandDark }]} />

      {/* Orange Angled Band */}
      <View style={[styles.footerOrangeBand, { backgroundColor: brandLight }]}>
        <Text style={styles.footerWebsiteText}>{website}</Text>
      </View>
    </View>
  );
}

// ----- MAIN DOCUMENT -----
export default function SaleInvoicePdf2({
  qrDataUrl,
  invoice,
  user,
  barcodeImage,
  termsData,
  logoUrl,
  session,
}) {
  const inv = invoice || {};
  const wattermark = inv?.data?.user_info.invoice_settings.watermark_text;
  const brandLight =
    inv?.data?.user_info?.invoice_settings?.first_code || "#a9d0b8";
  const brandDark =
    inv?.data?.user_info?.invoice_settings?.second_code || "#5c8a6d";

  // 🏪 Dizmo store detection
  const isDizmo =
    session?.user?.id === 265 ||
    session?.user?.id === 353 ||
    session?.user?.outlet_name?.toLowerCase()?.includes("dizmo") ||
    inv?.data?.user_info?.id === 265 ||
    inv?.data?.user_info?.id === 353 ||
    inv?.data?.user_info?.outlet_name?.toLowerCase()?.includes("dizmo");

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Existing Text Watermark */}
        <Text style={[styles.watermark, { color: brandLight }]}>
          {wattermark}
        </Text>

        <Header
          brandDark={brandDark}
          qrDataUrl={qrDataUrl}
          logoUrl={logoUrl}
          invoice={inv}
          user={user}
          barcodeImage={barcodeImage}
          isDizmo={isDizmo}
        />

        <CustomerInfo
          qrDataUrl={qrDataUrl}
          logoUrl={logoUrl}
          invoice={inv}
          user={user}
          barcodeImage={barcodeImage}
        />
        <ItemsTable invoice={inv} />
        <MiddleSection invoice={inv} termsData={termsData} qrDataUrl={qrDataUrl} />
        <FooterBar user={user} invoice={inv} />

        {/* Background Image Watermark (OVERLAY) */}
        {logoUrl && (
          <View style={styles.watermarkContainer} fixed>
            <Image
              src={logoUrl}
              style={styles.imageWatermark}
            />
          </View>
        )}

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
