/* eslint-disable react/prop-types */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from "@react-pdf/renderer";
import { formatBangladeshiAmount } from "@/lib/format-display-bdt";

Font.register({
  family: "TiroBangla",
  src: "/fonts/TiroBangla-Regular.ttf",
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 8,
    color: "#111827",
    position: "relative",
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

  logoImageContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },
  logoImage: {
    objectFit: "contain",
    width: 60,
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
    width: 70,
    height: 70,
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
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    marginTop: 10,
  },
  termsCol: {
    flex: 1,
    paddingHorizontal: 20,
   
  },
  totalsCol: {
    width: 190,
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
    fontFamily: "TiroBangla",
  },

  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
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

  // ----- FOOTER BAR -----
  footerBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerNote: {
    fontSize: 7,
    color: "#4B5563",
    textAlign: "center",
    marginHorizontal: 60,
    marginBottom: 4,
  },
  footerBar: {
    height: 30,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  footerCol: {
    flex: 1,
  },
  footerText: {
    fontSize: 8,
    color: "#FFFFFF",
  },
  footerTextCenter: {
    fontSize: 8,
    textAlign: "center",
    color: "#FFFFFF",
  },
  footerTextRight: {
    fontSize: 8,
    textAlign: "right",
    color: "#FFFFFF",
  },

  pageNum: {
    position: "absolute",
    fontSize: 7,
    bottom: 2,
    right: 20,
    color: "#6B7280",
  },

  watermark: {
    position: "absolute",
    top: "40%",
    left: "0%",
    width: "100%",
    textAlign: "center",
    opacity: 0.5,
    fontSize: 100,
    transform: "rotate(-45deg)",
  },
});



/* --------- HEADER ---------- */
function Header({ invoice, session, qrImage, barcodeId, logoUrl }) {
  const invUser = session?.user || {};
  const invSet = invUser?.invoice_settings || {};
  const brandLight = invSet.first_code || "#a9d0b8";
  const vendorName = invoice?.vendor_name || "Vendor";
  const vendorAddress = invoice?.vendor?.address || "N/A";
  const vendorPhone = invoice?.vendor_phone || "N/A";
  const purchaseId = barcodeId || invoice?.invoice_id || "-";
  const paymentMode = invoice?.pay_mode || "N/A";

  const d = invoice?.created_at ? new Date(invoice.created_at) : null;
  const dateStr = d
    ? `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    : "-";

  const shopName = invSet.shop_name || invUser.name || "Outlet";
  const shopAddress = invSet.shop_address || "";
  const binNo = invSet.bin || "N/A";
  const logo = logoUrl || null;
  return (
    <View style={[styles.headerCard, { backgroundColor: brandLight }]}>
      <View style={styles.headerRow}>
        {/* Left: Logo + Vendor */}
        <View style={styles.headerLeft}>
          <View style={styles.logoImageContainer}>
            <Image
                         style={styles.logoImage}
                         src={
                           logo ||
                           "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
                         }
                         width={50}
                         height={50}
                         alt={"Shop Logo"}
                       />
          </View>

          <Text style={styles.headerSectionTitle}>Vendor Details:</Text>

          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Name: </Text>
            {vendorName}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Address: </Text>
            {vendorAddress}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Number: </Text>
            {vendorPhone}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Purchase ID: </Text>
            {purchaseId}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Payment: </Text>
            {paymentMode}
          </Text>
        </View>

        {/* Center: QR + Barcode */}
        <View style={styles.headerCenter}>
          <View style={styles.qrWrapper}>
            {qrImage ? (
             <>
              <Image src={qrImage} style={styles.qrImage} />
              <Text style={{ fontSize: 7, color: "#6B7280" }}>{purchaseId}</Text>
             </>
            ) : ""}
          </View>
        </View>

        {/* Right: Shop Info */}
        <View style={styles.headerRight}>
  <Text style={styles.shopName}>{shopName}</Text>
  {shopAddress ? <Text style={styles.shopLine}>{shopAddress}</Text> : null}
  <Text style={styles.shopLine}>BIN No: {binNo}</Text>
  <Text style={styles.shopLine}>Purchase Date: {dateStr}</Text>


  {invoice.delivery_method_id > 0 &&
  invoice.delivery_method.type_name !== "hand-to-hand" ? (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 5 }}>
        • Delivery Info:
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 }}>
        <Text style={{ fontWeight: "bold" }}>Method: </Text>
        <Text>{invoice?.delivery_method.type_name}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 }}>
        <Text style={{ fontWeight: "bold" }}>Customer: </Text>
        <Text>{invoice?.delivery_customer_name}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 }}>
        <Text style={{ fontWeight: "bold" }}>Number: </Text>
        <Text>{invoice?.delivery_customer_phone}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Text style={{ fontWeight: "bold" }}>Address: </Text>
        <Text>{invoice?.delivery_customer_address}</Text>
      </View>
    </View>
  ) : null}
</View>

      </View>

   
    </View>
  );
}

/* --------- ITEMS TABLE ---------- */
function ItemsTable({ invoice, session }) {
  const invSet = session?.user?.invoice_settings || {};
  const brandDark = invSet.second_code || "#5c8a6d";

  const items = invoice?.purchase_details || [];

  const formatProductName = (item) => {
    let name = item?.product_info?.name || "Unnamed Product";

    const imeis = item?.product_imei;
    if (Array.isArray(imeis) && imeis.length > 0) {
      const first = imeis[0];
      const parts = [];
      if (first.color) parts.push(`Color: ${first.color}`);
      if (first.storage) parts.push(`Storage: ${first.storage}`);
      if (first.region) parts.push(`Region: ${first.region}`);
      if (parts.length > 0) name += ` (${parts.join(" | ")})`;
    }

    return name;
  };

  return (
    <View style={styles.tableWrapper}>
      <View style={styles.tableHeaderRow}>
        <View style={[styles.colProduct, { backgroundColor: brandDark }]}>
          <Text style={styles.th}>PRODUCT NAME</Text>
        </View>
        <View style={[styles.colPrice, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, styles.rightAlign]}>PRICE</Text>
        </View>
        <View style={[styles.colQty, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, styles.rightAlign]}>QTY</Text>
        </View>
        <View style={[styles.colSubtotal, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, styles.rightAlign, styles.thLast]}>
            SUBTOTAL
          </Text>
        </View>
      </View>

      {items.map((item, index) => {
        const name = formatProductName(item.product_info.name);

        const imeiStr =
          Array.isArray(item.product_imei) && item.product_imei.length > 0
            ? item.product_imei.map((i) => i.imei).filter(Boolean).join(", ")
            : "";

        const unitPrice = Number(item?.price ?? 0);
        const qty = Number(item?.qty ?? 0);
        const lineTotal = unitPrice * qty;

        return (
          <View key={index} style={styles.tdRow}>
            <View style={[styles.colProduct, styles.td]}>
              <Text style={styles.tdProductName}>{name}</Text>
              {imeiStr ? (
                <Text style={styles.tdImei}>IMEI: {imeiStr}</Text>
              ) : null}
              {item?.product_item_id && (
                <Text style={styles.tdImei}>
                  Barcode: {item?.product_items?.barcode}{" "}
                  {item?.product_items?.purchase_price
                    ? `· Price ${item.product_items.purchase_price}`
                    : ""}
                </Text>
              )}
            </View>

            <View style={[styles.colPrice, styles.td]}>
              <Text style={styles.rightAlign}>{formatBangladeshiAmount(unitPrice)}</Text>
            </View>
            <View style={[styles.colQty, styles.td]}>
              <Text style={styles.rightAlign}>{qty}</Text>
            </View>
            <View style={[styles.colSubtotal, styles.td, styles.tdLast]}>
              <Text style={styles.rightAlign}>{formatBangladeshiAmount(lineTotal)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* --------- MIDDLE SECTION ---------- */
function MiddleSection({ invoice, terms }) {
  const subTotal = Number(invoice?.sub_total ?? 0);
  const discount = Number(invoice?.discount ?? 0);
  const totalAmount = subTotal - discount;
  const paidAmount = Number(invoice?.paid_amount ?? 0);
  const dueAmount = totalAmount - paidAmount;

  return (
    <View style={styles.middleRow}>
      {/* Terms */}
      <View style={styles.termsCol}>
        <Text style={styles.termsTitle}>Terms & Condition</Text>
        {(terms).map((t, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{t.description}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsCol}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Sub-total:</Text>
          <Text style={styles.totalsValue}> {formatBangladeshiAmount(subTotal)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Discount:</Text>
          <Text style={styles.totalsValue}>(-)  {formatBangladeshiAmount(discount)}</Text>
        </View>
        <View
          style={[
            styles.totalsRow,
            {
              marginTop: 3,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              paddingTop: 3,
            },
          ]}
        >
          <Text style={styles.totalsLabelStrong}>Total Amount:</Text>
          <Text style={styles.totalsValueStrong}>
             {formatBangladeshiAmount(totalAmount)}
          </Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Paid Amount:</Text>
          <Text style={styles.totalsValue}>(-)  {formatBangladeshiAmount(paidAmount)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabelStrong}>Due Amount:</Text>
          <Text style={styles.totalsValueRed}> {formatBangladeshiAmount(dueAmount)}</Text>
        </View>
      </View>
    </View>
  );
}

/* --------- FOOTER ---------- */
function FooterBar({ session, invoice }) {
  const invUser = session?.user || {};
  const invSet = invUser?.invoice_settings || {};
  const brandDark = invSet.second_code || "#5c8a6d";

  const hotline = invUser.phone || "N/A";
  const website = invUser.web_address || "";
  const email = invSet.email || invUser.email || "";
  const purchaseCondition = invSet.purchase_condition;

  return (
    <View style={styles.footerBarWrapper}>
      <Text style={styles.footerNote}>
        {purchaseCondition ||
          "This is a system generated purchase invoice & doesn't need any signature."}
      </Text>

      <View style={[styles.footerBar, { backgroundColor: brandDark }]} fixed>
        <View style={styles.footerCol}>
          <Text style={styles.footerText}>Hotline: {hotline}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerTextCenter}>{website}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerTextRight}>E-Mail: {email}</Text>
        </View>
      </View>
    </View>
  );
}

/* --------- MAIN DOCUMENT ---------- */
export default function PurchaseInvoicePdf1({
  invoice,
  session,
  qrImage,       
  barcodeImage,
  terms,
  logoUrl
}) {
  const invSet = session?.user?.invoice_settings || {};
  const watermarkText = invSet.watermark_text || "Commerriva";
  const brandLight = invSet.first_code || "#a9d0b8";

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Watermark */}
        <Text style={[styles.watermark, { color: brandLight }]}>
          {watermarkText}
        </Text>

        <Header
        logoUrl={logoUrl}
          invoice={invoice}
          session={session}
          qrImage={qrImage}
          barcodeImage={barcodeImage}
          barcodeId={invoice?.invoice_id}
        />
        <ItemsTable invoice={invoice} session={session} />
        <MiddleSection invoice={invoice} terms={terms} />
        <FooterBar session={session} invoice={invoice} />

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