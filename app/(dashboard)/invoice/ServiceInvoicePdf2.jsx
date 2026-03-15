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

import { formatBangladeshiAmount } from "@/lib/format-display-bdt";

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

  // ── ANGLED HEADER ──
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
  headerLeft2: {
    position: "absolute",
    left: 24,
    top: 0,
    height: "100%",
    justifyContent: "center",
    zIndex: 5,
  },
  logo: {
    width: 90,
    objectFit: "contain",
  },
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

  // ── HEADER BOTTOM LINES ──
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

  // ── CUSTOMER INFO ──
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
  colLeft: { width: "40%" },
  colMiddle: { width: "25%" },
  colRight: { width: "35%", alignItems: "flex-end" },
  labelc: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  value: { fontSize: 9, marginBottom: 2 },
  valueBold: { fontSize: 10, fontWeight: "bold", marginBottom: 3 },
  valueRight: { fontSize: 9, marginBottom: 2, textAlign: "right" },

  // ── SERVICE INFO ROW ──
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    marginHorizontal: 20,
    padding: 6,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 2,
  },
  infoCell: { width: "33%", paddingHorizontal: 4 },
  infoLabel: { fontSize: 7, color: "#6B7280", fontWeight: "bold", marginBottom: 1 },
  infoValue: { fontSize: 8, color: "#111827" },

  // ── ITEMS TABLE ──
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
    width: "34%",
    borderRight: "1px solid #444",
    padding: 2,
  },
  invTbl_units: {
    width: "12%",
    borderRight: "1px solid #444",
    textAlign: "center",
    padding: 2,
  },
  invTbl_tech: {
    width: "30%",
    borderRight: "1px solid #444",
    padding: 2,
  },
  invTbl_fees: {
    width: "18%",
    textAlign: "right",
    padding: 2,
  },
  invTbl_name: { fontWeight: "bold" },
  invTbl_imei: { fontSize: 8, marginTop: 2 },

  // ── BOTTOM SECTION (Transaction + Totals) ──
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
  transDetails: { padding: 8 },
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

  // ── AMOUNT IN WORDS ──
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

  // ── TERMS & SIGNATURES ──
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
  termsTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletDot: { width: 8, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 8, color: "#111827" },

  signatureSectionPad: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    marginHorizontal: 40,
    marginBottom: 10,
  },
  sigBoxPad: { width: "30%", textAlign: "center" },
  sigLinePad: {
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
    paddingTop: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  qrCodePad: { width: 50, height: 50 },

  // ── FOOTER ──
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
    transform: "skewX(12deg)",
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0E6B57",
    letterSpacing: 1.5,
    textTransform: "lowercase",
  },

  // ── WATERMARK ──
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

  pageNum: {
    position: "absolute",
    fontSize: 7,
    bottom: 2,
    right: 20,
    color: "#6B7280",
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

  const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str += n[1] != 0 ? (a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`) + "Crore " : "";
  str += n[2] != 0 ? (a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`) + "Lakh " : "";
  str += n[3] != 0 ? (a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`) + "Thousand " : "";
  str += n[4] != 0 ? (a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`) + "Hundred " : "";
  str += n[5] != 0
    ? (str !== "" ? "and " : "") + (a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`)
    : "";

  return str.trim().toUpperCase();
};

// ═══════════════════════════════════════════
//  HEADER – angled design from SaleInvoicePdf2
// ═══════════════════════════════════════════
function Header({ brandDark, logoUrl, service, user }) {
  const invUser = service?.user_info || {};
  const invSet = user?.invoice_settings || invUser?.invoice_settings || {};
  const shopAddress = invUser?.address || "N/A";
  const shopEmail = invSet?.email || invUser?.email || "N/A";
  const shopNumber =
    [invSet?.mobile_number, invSet?.additional_mobile_number]
      .filter(Boolean)
      .join(" / ") ||
    user?.phone ||
    invUser?.phone ||
    "N/A";
  const brandLight = invSet?.first_code || invUser?.invoice_settings?.first_code || "#b5b5b5";
  const logo =
    logoUrl ||
    invSet?.shop_logo ||
    invUser?.logo ||
    invUser?.profile_pic ||
    null;

  return (
    <>
      <View style={styles.headerWrapper}>
        <View style={[styles.headerBase, { backgroundColor: brandDark }]} />
        <View style={styles.headerAngle} />

        <View style={styles.headerLeft2}>
          <Image
            src={
              logo ||
              "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
            }
            style={styles.logo}
          />
        </View>

        <View style={styles.headerRight2}>
          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopNumber}</Text>
            <Image src="https://cdn-icons-png.flaticon.com/512/724/724664.png" style={styles.shopIcon} />
          </View>
          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopEmail}</Text>
            <Image src="https://cdn-icons-png.flaticon.com/512/561/561127.png" style={styles.shopIcon} />
          </View>
          <View style={styles.shopRowRight}>
            <Text style={styles.shopText}>{shopAddress}</Text>
            <Image src="https://cdn-icons-png.flaticon.com/512/684/684908.png" style={styles.shopIcon} />
          </View>
        </View>
      </View>

      <View style={styles.wrapper}>
        <View style={[styles.leftLine, { backgroundColor: brandDark }]} />
        <View style={[styles.rightLine, { backgroundColor: brandLight }]} />
        <View style={[styles.rightAngle, { backgroundColor: brandLight }]} />
      </View>
    </>
  );
}

// ═══════════════════════════════════════════
//  CUSTOMER INFO
// ═══════════════════════════════════════════
function CustomerInfo({ service }) {
  const customer = service?.customers || {};
  const dateStr = service?.created_at
    ? new Date(service.created_at).toLocaleDateString()
    : "";

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>SERVICE INVOICE</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.colLeft}>
          <Text style={styles.labelc}>Customer</Text>
          <Text style={styles.valueBold}>{customer?.name || "Walk-in"}</Text>
          <Text style={styles.value}>
            Contact: {customer?.mobile_number || customer?.phone || "N/A"}
          </Text>
        </View>

        <View style={styles.colMiddle}>
          <Text style={styles.labelc}>Address</Text>
          <Text style={styles.value}>{customer?.address || "N/A"}</Text>
        </View>

        <View style={styles.colRight}>
          <Text style={styles.valueRight}>{service?.service_invoice_id || "-"}</Text>
          <Text style={styles.valueRight}>Date: {dateStr}</Text>
          <Text style={styles.valueRight}>Status: {service?.status || "Pending"}</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
//  SERVICE INFO ROW
// ═══════════════════════════════════════════
function ServiceInfoRow({ service, serviceTypeName }) {
  const displayName =
    serviceTypeName ||
    service?.service_type?.name ||
    service?.service_type_name ||
    (service?.service_type_id ? `Type #${service.service_type_id}` : "—");
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>SERVICE TYPE</Text>
        <Text style={styles.infoValue}>{displayName}</Text>
      </View>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>ISSUE DESCRIPTION</Text>
        <Text style={styles.infoValue}>{service?.issue_description || "—"}</Text>
      </View>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>CHECKING DESCRIPTION</Text>
        <Text style={styles.infoValue}>{service?.checking_description || "—"}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
//  ITEMS TABLE – Service columns
// ═══════════════════════════════════════════
function ItemsTable({ service }) {
  const items = service?.service_details || [];
  const fees = Number(service?.fees || 0);
  const vat = Number(service?.vat || 0);
  const tax = Number(service?.tax || 0);
  const discount = Number(service?.discount || 0);
  const total = Number(service?.total || 0);
  const paid = Number(service?.paid_amount || 0);
  const due = Number(service?.due_amount || 0);
  const returnAmt = Number(service?.return_amount || 0);

  const effectivePaid = returnAmt > 0 ? total : paid;
  const effectiveDue = returnAmt > 0 ? 0 : due;

  return (
    <View style={styles.invTbl_table}>
      {/* TABLE HEADER */}
      <View style={[styles.invTbl_row, styles.invTbl_header]}>
        <Text style={styles.invTbl_no}>N°</Text>
        <Text style={styles.invTbl_desc}>Description (Code)</Text>
        <Text style={styles.invTbl_units}>Units</Text>
        <Text style={styles.invTbl_tech}>Technicians</Text>
        <Text style={styles.invTbl_fees}>Fees</Text>
      </View>

      {/* TABLE ROWS */}
      {items.map((item, i) => {
        const name = item.product_info?.name || `Product #${item.product_id}`;
        const barcode = item.product_info?.barcode;
        const techs =
          (item.technician_list || item.technicians || [])
            .map((t) => t.name)
            .join(", ") || "—";

        return (
          <View key={item.id || i} style={styles.invTbl_row}>
            <Text style={styles.invTbl_no}>{i + 1}</Text>
            <View style={styles.invTbl_desc}>
              <Text style={styles.invTbl_name}>{name}</Text>
              {barcode && <Text style={styles.invTbl_imei}>Barcode: {barcode}</Text>}
            </View>
            <Text style={styles.invTbl_units}>{item.servicing_unit} Pcs</Text>
            <Text style={styles.invTbl_tech}>{techs}</Text>
            <Text style={styles.invTbl_fees}>
              {i === 0 ? formatBangladeshiAmount(fees) : "—"}
            </Text>
          </View>
        );
      })}

      {items.length === 0 && (
        <View style={styles.invTbl_row}>
          <Text style={styles.invTbl_no}>1</Text>
          <View style={styles.invTbl_desc}>
            <Text style={styles.invTbl_name}>Service Charge</Text>
          </View>
          <Text style={styles.invTbl_units}>—</Text>
          <Text style={styles.invTbl_tech}>—</Text>
          <Text style={styles.invTbl_fees}>{formatBangladeshiAmount(fees)}</Text>
        </View>
      )}

      {/* BOTTOM SECTION – Transaction + Totals */}
      <View style={styles.bottomSection}>
        {/* Left: Transaction Details */}
        <View style={styles.transactionCol}>
          <Text style={styles.sectionHeader}>Transaction Details</Text>
          <View style={styles.transDetails}>
            {service?.multiple_payment?.length > 0 ? (
              service.multiple_payment.map((pay, i) => (
                <View key={i} style={styles.transRow}>
                  <Text style={{ fontSize: 9 }}>
                    {pay?.payment_type?.type_name || "Payment"}
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                    {formatBangladeshiAmount(pay.payment_amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.transRow}>
                <Text style={{ fontSize: 9 }}>Cash</Text>
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  {formatBangladeshiAmount(effectivePaid)}
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
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>
              {formatBangladeshiAmount(effectivePaid)}
            </Text>
          </View>

          <View style={[styles.totalRow, { borderBottomWidth: 0, backgroundColor: "#f9fafb" }]}>
            <Text style={{ fontSize: 9, fontWeight: "bold" }}>Outstanding</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: effectiveDue > 0 ? "#b91c1c" : "#059669" }}>
              {formatBangladeshiAmount(effectiveDue)}
            </Text>
          </View>

          {returnAmt > 0 && (
            <View style={[styles.totalRow, { borderBottomWidth: 0 }]}>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#059669" }}>Change</Text>
              <Text style={{ fontSize: 9, fontWeight: "bold", color: "#059669" }}>
                {formatBangladeshiAmount(returnAmt)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
//  MIDDLE SECTION – Amount in words, Terms, Signatures
// ═══════════════════════════════════════════
function MiddleSection({ service, termsData, qrDataUrl }) {
  const total = Number(service?.total || 0);
  const amountWords =
    total > 0 ? `${numberToWords(Math.round(total))} TAKA ONLY` : "";

  return (
    <>
      <View style={styles.amountInWordsBox}>
        <Text style={styles.amountLabel}>Amount in words</Text>
        <Text style={styles.amountValue}>{amountWords}</Text>
      </View>

      <View style={styles.middleRow}>
        <View style={styles.termsCol}>
          <Text style={styles.termsTitle}>Terms & Condition</Text>
          {termsData?.map((t, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{t.description}</Text>
            </View>
          ))}
        </View>
      </View>

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

// ═══════════════════════════════════════════
//  FOOTER BAR – angled design from SaleInvoicePdf2
// ═══════════════════════════════════════════
function FooterBar({ service, user }) {
  const invUser = service?.user_info || {};
  const invSetFromUser = user?.invoice_settings || {};
  const invSetFromService = invUser?.invoice_settings || {};
  const invSet = { ...invSetFromService, ...invSetFromUser };

  const rawFirst = invSet.first_code;
  const rawSecond = invSet.second_code;

  const brandDark =
    rawSecond && rawSecond !== "null" ? rawSecond : "#4d4d4d";
  const brandLight =
    rawFirst && rawFirst !== "null" ? rawFirst : "#adadad";
  const website = invUser.web_address || invSet.web_address || "";

  return (
    <View style={styles.footerRoot} fixed>
      <View style={[styles.footerGreenBar, { backgroundColor: brandDark }]} />
      <View style={[styles.footerOrangeBand, { backgroundColor: brandLight }]}>
        <Text style={styles.footerWebsiteText}>{website}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
//  MAIN DOCUMENT
// ═══════════════════════════════════════════
export default function ServiceInvoicePdf2({
  qrDataUrl,
  service,
  user,
  logoUrl,
  termsData,
  session,
  serviceTypeName,
}) {
  const d = service || {};
  const invUser = d?.user_info || {};
  const invSetFromUser = user?.invoice_settings || {};
  const invSetFromService = invUser?.invoice_settings || {};

  const invSet = { ...invSetFromService, ...invSetFromUser };

  const watermarkText = invSet.watermark_text;

  const rawFirst = invSet.first_code;
  const rawSecond = invSet.second_code;

  const brandLight =
    rawFirst && rawFirst !== "null" ? rawFirst : "#a9d0b8";
  const brandDark =
    rawSecond && rawSecond !== "null" ? rawSecond : "#5c8a6d";

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Text Watermark */}
        <Text style={[styles.watermark, { color: brandLight }]}>
          {watermarkText}
        </Text>

        <Header
          brandDark={brandDark}
          logoUrl={logoUrl}
          service={d}
          user={user}
        />

        <CustomerInfo service={d} />
        <ServiceInfoRow service={d} serviceTypeName={serviceTypeName} />
        <ItemsTable service={d} />
        <MiddleSection service={d} termsData={termsData} qrDataUrl={qrDataUrl} />
        <FooterBar service={d} user={user} />

        {/* Image Watermark */}
        {logoUrl && (
          <View style={styles.watermarkContainer} fixed>
            <Image src={logoUrl} style={styles.imageWatermark} />
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
