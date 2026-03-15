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

// ✅ REGISTER BANGLA FONT
Font.register({
  family: "TiroBangla",
  src: "/fonts/TiroBangla-Regular.ttf",
});

// Avoid hyphenation/splitting
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 8,
    color: "#111827",
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

  // ===== HEADER (new style) =====
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

  // ===== CUSTOMER / INVOICE HEADER =====
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

  // ===== TABLE =====
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

  invTbl_summaryRow: {
    flexDirection: "row",
    minHeight: 60,
  },
  invTbl_summaryLeft: {
    width: "60%",
    borderRight: "1px solid #444",
    padding: 8,
  },
  invTbl_summaryRight: {
    width: "40%",
    paddingVertical: 8,
  },
  invTbl_sumLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  invTbl_payment: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 3,
  },
  invTbl_paymentLabel: {
    fontWeight: "bold",
    fontFamily: "TiroBangla",
  },
  invTbl_bold: {
    fontWeight: "bold",
  },

  // ===== TERMS =====
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  termsCol: {
    width: "100%",
    fontFamily: "TiroBangla",
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

  // ===== FOOTER =====
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
    transform: "skewX(12deg)",
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0E6B57",
    letterSpacing: 1.5,
    textTransform: "lowercase",
  },

  pageNum: {
    position: "absolute",
    fontSize: 7,
    bottom: 2,
    right: 20,
    color: "#6B7280",
  },
});

/* ================= HEADER ================= */

function Header({ brandDark, logoUrl, invoice, user }) {
  // In your return API, we still get user_info
  const shopInfo = invoice?.user_info || {};
  const shopAddress = shopInfo.address || "N/A";
  const shopEmail =
    user?.invoice_settings?.email || shopInfo.email || "N/A";
  const shopNumber =
    user?.invoice_settings?.phone_number || shopInfo.phone || "N/A";
  const brandLight =
    shopInfo?.invoice_settings?.first_code || "#b5b5b5";

  const logo = logoUrl || null;

  return (
    <>
      <View style={styles.headerWrapper}>
        {/* Base background */}
        <View style={[styles.headerBase, { backgroundColor: brandDark }]} />

        {/* Angled white section */}
        <View style={styles.headerAngle} />

        {/* Left content (logo) */}
        <View style={styles.headerLeft2}>
          <Image
            src={
              logo ||
              "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
            }
            style={styles.logo}
          />
        </View>

        {/* Right content (contacts) */}
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

      {/* Bottom color lines */}
      <View style={styles.wrapper}>
        <View
          style={[styles.leftLine, { backgroundColor: brandDark }]}
        />
        <View
          style={[styles.rightLine, { backgroundColor: brandLight }]}
        />
        <View
          style={[styles.rightAngle, { backgroundColor: brandLight }]}
        />
      </View>
    </>
  );
}

/* ================= CUSTOMER / INVOICE INFO ================= */

function CustomerInfo({ invoice }) {
  // Return API: `customers` may be null; we handle gracefully
  const vendor = invoice?.purchase.vendor || {};

  const returnId = invoice?.return_id || "-";
 

  const dateStr = invoice?.invoice_date || invoice?.created_at || "";

  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString()
    : "";

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>PURCHASE RETURN INVOICE</Text>
      </View>

      {/* MAIN HEADER ROW */}
      <View style={styles.row}>
        {/* LEFT – CUSTOMER */}
        <View style={styles.colLeft}>
          <Text style={styles.labelc}>Vendor</Text>
          <Text style={styles.valueBold}>
            {vendor?.name || invoice?.purchase?.vendor.name || "-"}
          </Text>
          <Text style={styles.value}>
            Contact:{" "}
            {vendor?.mobile_number ||
              vendor?.customer_phone ||
              "-"}
          </Text>
        </View>

        {/* MIDDLE – ADDRESS */}
        <View style={styles.colMiddle}>
          <Text style={styles.labelc}>Address</Text>
          <Text style={styles.value}>
            {vendor?.address ||
              vendor?.customer_address ||
              "-"}
          </Text>
        </View>

        {/* RIGHT – RETURN INFO */}
        <View style={styles.colRight}>
          {/* If you have barcode for return, add here */}
          {/* <Image src={invoice?.barcode} style={styles.barcode} /> */}

          <Text style={styles.valueRight}>
            {returnId}
          </Text>
       
          <Text style={styles.valueRight}>Date: {formattedDate}</Text>
        </View>
      </View>
    </View>
  );
}

/* ================= ITEMS TABLE (RETURN LINES) ================= */

function ItemsTable({ invoice }) {
  const items = invoice?.purchase_details || [];

  // If API already provides `return_amount` (sum), prefer that:
  const apiTotalReturn = Number(invoice?.return_amount ?? 0);

  // Calculate linewise total as fallback / cross-check
  const calcTotal = items.reduce(
    (sum, item) => sum + Number(item?.return_amount ?? 0),
    0
  );

  const totalReturn =
    apiTotalReturn > 0 ? apiTotalReturn : calcTotal;

  return (
    <View style={styles.invTbl_table}>
      {/* HEADER */}
      <View style={[styles.invTbl_row, styles.invTbl_header]}>
        <Text style={styles.invTbl_no}>No</Text>
        <Text style={styles.invTbl_desc}>Description (Code)</Text>
        <Text style={styles.invTbl_price}>Unit Price</Text>
        <Text style={styles.invTbl_qty}>Return Qty</Text>
        <Text style={styles.invTbl_dis}>Dis</Text>
        <Text style={styles.invTbl_total}>Return Amt</Text>
      </View>

      {/* ITEMS */}
      {items.map((item, index) => {
        const name =
          item?.product_info?.name || "Product";
        const code =
          item?.product_info?.barcode ||
          item?.product_info?.sku ||
          "";
const formatImeis = (productImei) => {
  if (Array.isArray(productImei)) {
    return productImei.map(i => i?.imei).filter(Boolean).join(", ");
  }
  if (productImei?.imei) {
    return productImei.imei;
  }
  return "";
};

const imeis = formatImeis(item?.product_imei);

        const unitPrice = Number(item?.return_unit_price ?? 0);
        const qty = Number(item?.return_qty ?? 0);
        const lineTotal =
          Number(item?.return_amount ?? unitPrice * qty);

        return (
          <View key={index} style={styles.invTbl_row}>
            <Text style={styles.invTbl_no}>{index + 1}</Text>

            <View style={styles.invTbl_desc}>
              <Text style={styles.invTbl_name}>
                {name}
                {code ? ` (${code})` : ""}
              </Text>
              {imeis ? (
                <Text style={styles.invTbl_imei}>
                  IMEI# {imeis}
                </Text>
              ) : null}
            </View>

            <Text style={styles.invTbl_price}>
              {formatBangladeshiAmount(unitPrice)}
            </Text>
            <Text style={styles.invTbl_qty}>
              {qty.toFixed(2)} Pcs
            </Text>
            {/* If you have discount per line, use it; else "-" */}
            <Text style={styles.invTbl_dis}>-</Text>
            <Text style={styles.invTbl_total}>
              {formatBangladeshiAmount(lineTotal)}
            </Text>
          </View>
        );
      })}

      {/* SUMMARY ROW */}
      <View style={styles.invTbl_summaryRow}>
        {/* LEFT: NOTE or DESCRIPTION */}
        <View style={styles.invTbl_summaryLeft}>
          <Text style={styles.invTbl_paymentLabel}>
            Return Description:
          </Text>
          <Text>
            {invoice?.return_description || "-"}
          </Text>
        </View>

        {/* RIGHT: TOTAL RETURN */}
        <View style={styles.invTbl_summaryRight}>
          <View
            style={[
              styles.invTbl_sumLine,
              {
                borderBottomWidth: 1,
                borderBottomColor: "#000",
                paddingBottom: 5,
              },
            ]}
          >
            <Text style={{ paddingLeft: 5 }}>
              Total Return Amount
            </Text>
            <Text style={{ paddingRight: 5 }}>
              {formatBangladeshiAmount(totalReturn)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ================= TERMS SECTION ================= */

function MiddleSection({ termsData }) {
  if (!termsData || !termsData.length) return null;

  return (
    <View style={styles.middleRow}>
      <View style={styles.termsCol}>
        <Text style={styles.termsTitle}>
          Terms & Condition
        </Text>
        {termsData.map((t, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              {t.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ================= FOOTER ================= */

function FooterBar({ invoice }) {
  const invUser = invoice?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const brandDark =
    invSet?.second_code || "#4d4d4d";
  const brandLight =
    invSet?.first_code || "#adadad";

  const website =
    invUser.web_address || invSet.web_address || "";

  return (
    <View style={styles.footerRoot} fixed>
      <View
        style={[
          styles.footerGreenBar,
          { backgroundColor: brandDark },
        ]}
      />
      <View
        style={[
          styles.footerOrangeBand,
          { backgroundColor: brandLight },
        ]}
      >
        <Text style={styles.footerWebsiteText}>
          {website}
        </Text>
      </View>
    </View>
  );
}

/* ================= MAIN DOCUMENT ================= */

export default function PurchaseReturnInvoicePdf2({
  invoice,     // <-- expects the return API object you shared
  user,
  logoUrl,
  termsData = [],
}) {
  const inv = invoice || {};
  const invUser = inv?.user_info || {};
  const invSet = invUser?.invoice_settings || {};

  const watermark =
    invSet?.watermark_text || "";
  const brandLight =
    invSet?.first_code || "#a9d0b8";
  const brandDark =
    invSet?.second_code || "#5c8a6d";

  return (
    <Document>
      <Page
        size="A4"
        orientation="portrait"
        style={styles.page}
      >
        {watermark ? (
          <Text
            style={[
              styles.watermark,
              { color: brandLight },
            ]}
          >
            {watermark}
          </Text>
        ) : null}

        <Header
          brandDark={brandDark}
          logoUrl={logoUrl}
          invoice={inv}
          user={user}
        />

        <CustomerInfo invoice={inv} />

        <ItemsTable invoice={inv} />

        <MiddleSection termsData={termsData} />

        <FooterBar invoice={inv} />

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