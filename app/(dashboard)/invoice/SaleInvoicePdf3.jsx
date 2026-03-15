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

// Register fonts
Font.register({
  family: "NotoSerifBengali",
  fonts: [
    { src: "/fonts/NotoSerifBengali-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSerifBengali-Bold.ttf", fontWeight: "bold" },
  ],
});

// Avoid hyphenation/splitting
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingBottom: 100, // accommodate footer
    fontSize: 10,
    fontFamily: "NotoSerifBengali",
    color: "#111",
    position: "relative",
  },
  // --- Header ---
  headerTopBackground: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    width: "60%",
  },
  shopNameText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  shopAddressText: {
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
  invoiceText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerBottomStrip: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripTextLeft: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  stripTextRight: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // --- Invoice Info (Customer) ---
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
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
  barcode: {
    width: 120,
    height: 25,
    alignSelf: "flex-end",
    marginBottom: 2,
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

  // --- Table ---
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
  colNo: { width: "5%", textAlign: "center" },
  colDesc: { width: "45%", textAlign: "left" },
  colPrice: { width: "15%", textAlign: "right" },
  colQty: { width: "10%", textAlign: "center" },
  colDis: { width: "10%", textAlign: "center" },
  colTotal: { width: "15%", textAlign: "right", borderRightWidth: 0 },

  // --- Bottom Section (Transaction + Totals) ---
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
    marginHorizontal: 20,
    padding: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
  },

  // --- Terms (if needed above footer) ---
  terms: {
    marginHorizontal: 20,
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

  // --- Footer Structure ---
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
  footerLeft: {
    width: "70%",
    paddingRight: 20,
  },
  footerRight: {
    width: "25%",
    alignItems: "center",
  },
  tcTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  tcCondition: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },
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
  footerBottomStrip: {
    width: "100%",
    height: 15,
  },
});

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

  const n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str +=
    n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
  str +=
    n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
      (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
      ""
      : "";

  return str.trim().toUpperCase();
};

const formatProductName = (item, invoice) => {
  let name =
    item?.product_info?.name || item?.product_name || "Unknown Product";

  if (
    item?.product_info?.have_product_variant ||
    item?.have_product_variant ||
    item?.product_variant
  ) {
    const variantName = item?.product_variant?.name;
    if (variantName) {
      name += ` - ${variantName}`;
    }

    const childVariant = item?.child_product_variant;
    if (childVariant?.name) {
      name += ` - ${childVariant.name}`;
    }
  }

  const defWarranties = invoice?.data?.defaultwarranties;
  let warrantyName = "";
  if (Array.isArray(defWarranties)) {
    const wItem = defWarranties.find((w) => w.product_id === item.product_id);
    if (wItem?.warranty?.name) {
      warrantyName = wItem.warranty.name;
    }
  }

  if (warrantyName) {
    const pattern = `(${warrantyName})`;
    if (name.includes(pattern)) {
      name = name.replace(pattern, "").trim();
    } else if (name.includes(warrantyName)) {
      name = name.replace(warrantyName, "").trim();
    }
  }

  const imeiData = item?.product_imei;
  if (Array.isArray(imeiData) && imeiData.length > 0) {
    const first = imeiData[0];
    const parts = [];
    if (first.color) parts.push(`Color: ${first.color}`);
    if (first.storage) parts.push(`Storage: ${first.storage}`);
    if (first.region) parts.push(`Region: ${first.region}`);
    if (parts.length > 0) name += ` (${parts.join(" | ")})`;
  }

  if (warrantyName) {
    name += ` (${warrantyName})`;
  }

  return name;
};

const SaleInvoicePdf3 = ({
  invoice,
  qrDataUrl,
  termsData,
  userSettings,
  calculations,
  barcodeImage,
}) => {
  // Theme colors from API settings
  const mainColor = userSettings?.first_code || invoice?.data?.user_info?.invoice_settings?.first_code || "#f97316"; // fallback orange
  const darkColor = userSettings?.second_code || invoice?.data?.user_info?.invoice_settings?.second_code || "#111827"; // fallback dark/black

  const shopName =
    userSettings?.shop_name ||
    invoice?.data?.user_info?.invoice_settings?.shop_name ||
    "Shop Name";

  // --- Pull Contact Info Like Pdf2 ---
  const shopEmail =
    userSettings?.email || invoice?.data?.user_info?.email || "";

  const invSettings = userSettings || invoice?.data?.user_info?.invoice_settings || {};
  const shopNumber =
    [
      invSettings?.mobile_number,
      invSettings?.additional_mobile_number
    ].filter(Boolean).join(" / ") ||
    invoice?.data?.user_info?.phone ||
    "";

  const shopAddress =
    userSettings?.shop_address ||
    invoice?.data?.user_info?.invoice_settings?.shop_address ||
    invoice?.data?.user_info?.address ||
    "Shop Address";

  const subTotal = calculations?.subTotal ?? Number(invoice?.data?.total_amount || 0);
  const discount = calculations?.discount ?? Number(invoice?.data?.discount || 0);
  const vat = calculations?.vat ?? Number(invoice?.data?.vat || 0);
  const deliveryFee = calculations?.deliveryFee ?? Number(invoice?.data?.delivery_fee || 0);
  const total = calculations?.total ?? Number(invoice?.data?.final_amount || 0);
  const paid = calculations?.paid ?? Number(invoice?.data?.paid_amount || 0);
  const changeAmount = calculations?.changeAmount ?? Number(invoice?.data?.cash_change || 0);
  const finalDue = calculations?.totalDue ?? 0;

  const finalPaid = changeAmount > 0 ? paid - changeAmount : paid;
  const exchangeImeis = invoice?.data?.exchange_imeis || [];
  const salesDetails = invoice?.data?.sales_details || [];

  const calculatedTotal = salesDetails.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.qty || 0);
  }, 0);

  const exchangeTotal = exchangeImeis.reduce(
    (sum, ex) => sum + Number(ex.purchase_price || 0),
    0
  );
  const finalTotal = calculatedTotal - exchangeTotal - discount + vat + deliveryFee;

  const effectivePaid = changeAmount > 0 ? finalTotal : paid;
  const effectiveDue = changeAmount > 0 ? 0 : finalTotal - effectivePaid;

  const invNo = invoice?.data?.invoice_id || invoice?.data?.custom_invoice_id || "";
  const invDate = invoice?.data?.created_at
    ? new Date(invoice.data.created_at).toLocaleDateString("en-GB")
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ================= HEADER ================= */}
        <View style={[styles.headerTopBackground, { backgroundColor: darkColor }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.shopNameText, { color: mainColor }]}>{shopName}</Text>
            {/* Contact Info */}
            {shopNumber ? <Text style={styles.shopAddressText}>{shopNumber}</Text> : null}
            {shopEmail ? <Text style={styles.shopAddressText}>{shopEmail}</Text> : null}

            {/* Shop Address */}
            {shopAddress ? <Text style={styles.shopAddressText}>{shopAddress}</Text> : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.invoiceText, { color: mainColor }]}>Invoice</Text>
          </View>
        </View>

        <View style={[styles.headerBottomStrip, { backgroundColor: mainColor }]}>
          <Text style={styles.stripTextLeft}>Invoice No - #{invNo}</Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Text style={styles.stripTextRight}>Date</Text>
            <Text style={styles.stripTextRight}>{invDate}</Text>
          </View>
        </View>

        {/* ================= INVOICE INFO (CUSTOMER) ================= */}
        <View style={styles.infoRow}>
          {/* COL 1: Customer */}
          <View style={styles.infoColLeft}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>
              {invoice?.data?.customer_name ||
                invoice?.delivery_customer_name ||
                "N/A"}
            </Text>
            <Text style={styles.subValue}>
              Contact:{" "}
              {invoice?.data?.customer_phone ||
                invoice?.delivery_customer_phone ||
                "N/A"}
            </Text>
          </View>

          {/* COL 2: Address */}
          <View style={styles.infoColCenter}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>
              {invoice?.data?.customer_address ||
                invoice?.data?.delivery_customer_address ||
                "N/A"}
            </Text>
          </View>

          {/* COL 3: Barcode */}
          <View style={styles.infoColRight}>
            {barcodeImage && (
              <Image src={barcodeImage} style={styles.barcode} />
            )}
            <Text style={{ fontSize: 9 }}>
              InvSL: # <Text style={{ fontWeight: "bold" }}>{invoice?.data?.id}</Text>
            </Text>
          </View>
        </View>

        {/* ================= TABLE ================= */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colNo]}>N°</Text>
            <Text style={[styles.th, styles.colDesc]}>Description(Code)</Text>
            <Text style={[styles.th, styles.colPrice]}>Price</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colDis]}>Dis</Text>
            <Text style={[styles.th, styles.colTotal, { borderRightWidth: 0 }]}>
              Total
            </Text>
          </View>

          {salesDetails.map((item, index) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={[styles.td, styles.colNo]}>{index + 1}</Text>
              <View style={[styles.td, styles.colDesc]}>
                <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                  {formatProductName(item, invoice)}
                </Text>
                {Array.isArray(item.product_imei) &&
                  item.product_imei.length > 0 ? (
                  <Text style={{ fontSize: 8, color: "#6b7280" }}>
                    IMEI: {item.product_imei[0].imei}
                  </Text>
                ) : item?.product_info?.barcode ? (
                  <Text style={{ fontSize: 8, color: "#6b7280" }}>
                    Barcode: {item.product_info.barcode}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.td, styles.colPrice]}>
                {Number(item.price).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text style={[styles.td, styles.colQty]}>{item.qty} Pcs</Text>
              <Text style={[styles.td, styles.colDis]}>-</Text>
              <Text
                style={[
                  styles.td,
                  styles.colTotal,
                  { borderRightWidth: 0, fontWeight: "bold" },
                ]}
              >
                {(item.price * item.qty).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}

          {/* Exchange Rows */}
          {exchangeImeis.map((ex) => (
            <View
              style={[styles.tableRow, { backgroundColor: "#fef2f2" }]}
              key={`ex-${ex.id}`}
            >
              <Text style={[styles.td, styles.colNo, { color: "#b91c1c" }]}>
                Ex
              </Text>
              <View style={[styles.td, styles.colDesc]}>
                <Text style={{ fontWeight: "bold", color: "#b91c1c" }}>
                  {ex.product_name}
                </Text>
                <Text style={{ fontSize: 8, color: "#b91c1c" }}>
                  IMEI: {ex.imei} (Exchange)
                </Text>
              </View>
              <Text style={[styles.td, styles.colPrice, { color: "#b91c1c" }]}>
                {Number(ex.purchase_price || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text style={[styles.td, styles.colQty, { color: "#b91c1c" }]}>
                1 Pcs
              </Text>
              <Text style={[styles.td, styles.colDis]}>-</Text>
              <Text
                style={[
                  styles.td,
                  styles.colTotal,
                  { borderRightWidth: 0, fontWeight: "bold", color: "#b91c1c" },
                ]}
              >
                (-)
                {Number(ex.purchase_price || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          ))}
        </View>

        {/* ================= BOTTOM SECTION (Transactions + Totals) ================= */}
        <View style={styles.bottomSection}>
          <View style={styles.transactionCol}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>
            <View style={styles.transDetails}>
              {invoice?.data?.multiple_payment?.length > 0 ? (
                invoice.data.multiple_payment.map((pay, i) => (
                  <View key={i} style={styles.transRow}>
                    <Text style={{ fontSize: 9 }}>
                      {pay?.payment_type?.type_name || "Payment"}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                      {Number(pay.payment_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>
                    {invoice?.data?.pay_mode || "Cash"}
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {effectivePaid.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.totalsCol}>
            {vat > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>
                  VAT
                </Text>
                <Text style={{ fontSize: 9 }}>
                  {vat.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            {deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>
                  Delivery
                </Text>
                <Text style={{ fontSize: 9 }}>
                  {deliveryFee.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>
                  Discount
                </Text>
                <Text style={{ fontSize: 9 }}>
                  (-)
                  {discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={styles.totalRowFinal}>
              <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
                Gross Total
              </Text>
              <Text style={styles.grandTotal}>
                {finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#4b5563" }}>
                Paid Amount
              </Text>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                {effectivePaid.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: effectiveDue > 0 ? "#b91c1c" : "#059669",
                }}
              >
                {effectiveDue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= AMOUNT IN WORDS ================= */}
        <View style={styles.amountInWords}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: "#4b5563", textTransform: "uppercase", marginBottom: 2 }}>
            Amount in words
          </Text>
          <Text style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
            {numberToWords(Math.round(finalTotal))} TAKA ONLY
          </Text>
        </View>

        {/* Footer (Fixed at Bottom with Signature, terms and bottom strap) */}
        <View style={styles.footerContainer} fixed>
          <View style={styles.footerContentWrapper}>
            {/* Left Side: Term & Condition Text */}
            <View style={styles.footerLeft}>
              <Text style={styles.tcTitle}>T&C Will Apply</Text>
              {/* According to requested image, the policy text is colored */}
              <Text style={[styles.tcCondition, { color: mainColor }]}>
                Kindly make sure you've read the policies throughly before exiting the shop
              </Text>
              <Text style={styles.thanksText}>Thanks For Your Purchase</Text>
            </View>
            {/* Right Side: Signature */}
            <View style={styles.footerRight}>
              <Text style={styles.sigLine}>Authorised Signature</Text>
            </View>
          </View>
          <View style={[styles.footerBottomStrip, { backgroundColor: mainColor }]} />
        </View>

      </Page>
    </Document>
  );
};

export default SaleInvoicePdf3;
