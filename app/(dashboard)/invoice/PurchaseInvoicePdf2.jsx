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
    { src: "/fonts/NotoSerifBengali-Regular.ttf" },
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
    paddingTop: 0,
    paddingBottom: 80,
    fontSize: 8,
    color: "#111827",
    fontFamily: "NotoSerifBengali",
  },

  // ----- HEADER CARD -----
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  leftCol: {
    width: "40%",
  },
  centerCol: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  rightCol: {
    width: "35%",
    alignItems: "flex-end",
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
  tableBorder: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#44403C",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#44403C",
    minHeight: 22,
  },
  tableHeader: {
    fontWeight: "bold",
    fontSize: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 3,
    textAlign: "center",
  },

  colSl: { width: "5%" },
  colName: { width: "40%" },
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
    width: "40%",
    backgroundColor: "#fff",
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
    fontSize: 8,
    marginRight: 5,
  },
  bulletText: {
    fontSize: 8,
    fontFamily: "NotoSerifBengali",
  },

  // ----- TOTALS -----
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  totalsLabel: {
    fontSize: 8,
    color: "#4B5563",
  },
  totalsValue: {
    fontSize: 8,
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
    width: 80,
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
  },

  //   new header
  headerWrapper: {
    width: "100%",
    height: 90,
    position: "relative",
    marginBottom: 2,
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
    width: 60,
    objectFit: "contain",
  },

  /* RIGHT (Shop Info inside angle) */
  headerRight2: {
    position: "absolute",
    right: 30,
    top: 20,
    width: 220,
    zIndex: 0,
  },

  shopRowRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },

  shopIcon: {
    width: 12,
    height: 12,
    zIndex: 20,
    marginLeft: 6,
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

  // vendor header

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
    minHeight: 26,
  },

  invTbl_header: {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
  },

  invTbl_no: {
    width: "6%",
    borderRight: "1px solid #444",
    textAlign: "center",
    padding: 6,
  },

  invTbl_desc: {
    width: "44%",
    borderRight: "1px solid #444",
    padding: 6,
  },

  invTbl_price: {
    width: "14%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 6,
  },

  invTbl_qty: {
    width: "10%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 6,
  },

  invTbl_dis: {
    width: "10%",
    borderRight: "1px solid #444",
    textAlign: "right",
    padding: 6,
  },

  invTbl_total: {
    width: "16%",
    textAlign: "right",
    padding: 6,
  },

  invTbl_name: {
    fontWeight: "bold",
  },

  invTbl_imei: {
    fontSize: 8,
    marginTop: 2,
  },

  // ----- TRANSACTION + TOTALS BOTTOM SECTION -----
  bottomSection: {
    flexDirection: "row",
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    marginBottom: 15,
    marginTop: 10,
  },
  transactionCol: {
    width: "60%",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    backgroundColor: "#f9fafb",
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
    padding: 6,
  },
  transRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginBottom: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
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
    height: 45,
  },

  footerGreenBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
  },

  footerOrangeBand: {
    position: "absolute",
    bottom: 14,
    left: 40,
    right: 40,
    height: 18,
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
    marginBottom: 2,
    textTransform: "uppercase",
  },
  amountValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
  },
  signatureSectionPad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
    paddingHorizontal: 30,
    textAlign: "center",
  },
  sigBoxPad: {
    width: 120,
    alignItems: "center",
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

// Number to words (used for Amount in words)
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

  const n = (`000000000${num}`)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
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
  const shopAddress = invoice?.user_info?.address || "N/A";
  const shopEmail =
    user?.invoice_settings?.email || invoice?.user_info?.email || "N/A";
  const invSettings = user?.invoice_settings || invoice?.user_info?.invoice_settings || {};
  const shopNumber =
    [
      invSettings?.mobile_number,
      invSettings?.additional_mobile_number
    ].filter(Boolean).join(" / ") ||
    user?.phone ||
    invoice?.user_info?.phone ||
    "N/A";
  const brandLight =
    invoice?.user_info?.invoice_settings.first_code || "#b5b5b5";

  const logo = logoUrl || null;

  return (
    <>
      <View style={styles.headerWrapper}>
        {/* Base dark background */}
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
              width: 230,
              height: 90,
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
        {/* Left dark line */}
        <View style={[styles.leftLine, { backgroundColor: brandDark }]} />

        {/* Right accent line */}
        <View style={[styles.rightLine, { backgroundColor: brandLight }]} />

        {/* Right angled shape */}
        <View style={[styles.rightAngle, { backgroundColor: brandLight }]} />
      </View>
    </>
  );
}

function VendorInfo({ invoice, barcodeImage }) {
  const vendor = invoice?.vendor || {};
  return (
    <View style={styles.container}>
      {/* TITLE */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>PURCHASE INVOICE</Text>
      </View>

      {/* MAIN HEADER ROW */}
      <View style={styles.row}>
        {/* LEFT – VENDOR */}
        <View style={styles.colLeft}>
          <Text style={styles.labelc}>Vendor</Text>

          <Text style={styles.valueBold}>{vendor.name || invoice?.vendor_name || "-"}</Text>

          <Text style={styles.value}>
            Contact: {vendor.mobile_number || invoice?.vendor_phone || "-"}
          </Text>
        </View>

        {/* MIDDLE – ADDRESS */}
        <View style={styles.colMiddle}>
          <Text style={styles.labelc}>Address</Text>

          <Text style={styles.value}>{vendor.address || "-"}</Text>
        </View>

        {/* RIGHT – INVOICE INFO */}
        <View style={styles.colRight}>
          {/* BARCODE */}
          {barcodeImage && (
            <Image src={barcodeImage} style={styles.barcode} />
          )}

          <Text style={styles.valueRight}>
            {invoice?.custom_invoice_id || invoice?.invoice_id || "-"}
          </Text>

          <Text style={styles.valueRight}>
            Date:{" "}
            {invoice?.created_at
              ? new Date(invoice.created_at).toLocaleDateString()
              : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ItemsTable({ invoice }) {
  const items = invoice?.purchase_details || [];

  const subTotal = Number(invoice?.sub_total ?? 0);
  const discount = Number(invoice?.discount ?? 0);
  const totalAmount = subTotal - discount;
  const paidAmount = Number(invoice?.paid_amount ?? 0);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

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

          const childVariantName = item?.child_product_variant?.name;
          if (childVariantName) name += ` - ${childVariantName}`;
        }

        // Append IMEI specs (Color, Storage, Region)
        const imeiData = item?.product_imei;
        if (Array.isArray(imeiData) && imeiData.length > 0) {
          const first = imeiData[0];
          const parts = [];
          if (first.color) parts.push(`Color: ${first.color}`);
          if (first.storage) parts.push(`Storage: ${first.storage}`);
          if (first.region) parts.push(`Region: ${first.region}`);
          if (parts.length > 0) name += ` (${parts.join(" | ")})`;
        }

        const imeis = (item?.product_imei || [])
          .map((i) => i.imei)
          .filter(Boolean)
          .join(", ");

        const price = Number(item?.price ?? item?.purchase_price ?? 0);
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

      {/* SUMMARY ROW – Matching SaleInvoicePdf2 layout */}
      <View style={styles.bottomSection}>
        {/* Left: Transaction Details */}
        <View style={styles.transactionCol}>
          <Text style={styles.sectionHeader}>Transaction Details</Text>
          <View style={styles.transDetails}>
            {invoice?.multiple_payments?.length > 0 ? (
              invoice.multiple_payments.map((pay, i) => (
                <View key={i} style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>{pay?.payment_type?.type_name || "Payment"}</Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {formatBangladeshiAmount(pay.payment_amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.transRow}>
                <Text style={{ fontSize: 9 }}>{invoice?.pay_mode || "Cash"}</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  {formatBangladeshiAmount(paidAmount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right: Totals */}
        <View style={styles.totalsCol}>
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
              {formatBangladeshiAmount(totalAmount)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>Paid Amount</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
              {formatBangladeshiAmount(paidAmount)}
            </Text>
          </View>

          <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: dueAmount > 0 ? "#b91c1c" : "#059669" }}>
              {formatBangladeshiAmount(dueAmount)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MiddleSection({ invoice, termsData, qrDataUrl }) {
  const subTotal = Number(invoice?.sub_total ?? 0);
  const discount = Number(invoice?.discount ?? 0);
  const finalTotal = subTotal - discount;

  const amountWords =
    finalTotal > 0
      ? `${numberToWords(Math.round(finalTotal))} TAKA ONLY`
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
          <Text style={styles.sigLinePad}>Vendor Signature</Text>
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
  const invUser = invoice?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const brandDark = invUser?.invoice_settings?.second_code || "#4d4d4d";
  const brandLight = invUser?.invoice_settings?.first_code || "#adadad";

  const website = invUser.web_address || invSet.web_address || "";

  return (
    <View style={styles.footerRoot} fixed>
      {/* Dark Base Bar */}
      <View style={[styles.footerGreenBar, { backgroundColor: brandDark }]} />

      {/* Accent Angled Band */}
      <View style={[styles.footerOrangeBand, { backgroundColor: brandLight }]}>
        <Text style={styles.footerWebsiteText}>{website}</Text>
      </View>
    </View>
  );
}

// ----- MAIN DOCUMENT -----
export default function PurchaseInvoicePdf2({
  qrDataUrl,
  invoice,
  user,
  barcodeImage,
  termsData,
  logoUrl,
  terms,
}) {
  const inv = invoice || {};
  const wattermark = inv?.user_info?.invoice_settings?.watermark_text;
  const brandLight =
    inv?.user_info?.invoice_settings?.first_code || "#a9d0b8";
  const brandDark =
    inv?.user_info?.invoice_settings?.second_code || "#5c8a6d";

  // Support both `termsData` and `terms` prop names
  const termsArray = termsData || terms || [];

  // 🏪 Dizmo store detection
  const isDizmo =
    user?.id === 265 ||
    user?.id === 353 ||
    user?.outlet_name?.toLowerCase()?.includes("dizmo") ||
    inv?.user_info?.id === 265 ||
    inv?.user_info?.id === 353 ||
    inv?.user_info?.outlet_name?.toLowerCase()?.includes("dizmo");

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
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

        <VendorInfo
          qrDataUrl={qrDataUrl}
          logoUrl={logoUrl}
          invoice={inv}
          user={user}
          barcodeImage={barcodeImage}
        />
        <ItemsTable invoice={inv} />
        <MiddleSection invoice={inv} termsData={termsArray} qrDataUrl={qrDataUrl} />
        <FooterBar user={user} invoice={inv} />

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
