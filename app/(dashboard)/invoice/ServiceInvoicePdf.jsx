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
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 35,
    paddingBottom: 60,
    fontSize: 8,
    color: "#111827",
    fontFamily: "NotoSerifBengali",
  },
  headerCard: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: -35,
    borderBottomRightRadius: "5rem",
    borderBottomLeftRadius: "5rem",
  },
  headerTopStrip: { marginBottom: 6 },
  headerRow: { flexDirection: "row" },
  headerLeft: { width: "40%", paddingRight: 6 },
  headerCenter: { width: "20%", alignItems: "center", justifyContent: "flex-start" },
  headerRight: { width: "40%", paddingLeft: 6, alignItems: "flex-end" },
  headerSectionTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 3 },
  headerLine: { fontSize: 8, marginBottom: 3, color: "#111827" },
  headerLabel: { fontWeight: "bold" },
  qrWrapper: { alignItems: "center", justifyContent: "center" },
  shopName: { fontSize: 11, fontWeight: "bold", marginBottom: 2 },
  shopLine: { fontSize: 8, marginBottom: 3, color: "#111827" },
  logoImage: { objectFit: "contain", width: 80 },
  logoImageContainer: { display: "flex", flexDirection: "column", marginBottom: 10 },

  tableWrapper: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  tableHeaderRow: { flexDirection: "row" },
  th: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  thLast: { borderRightWidth: 0 },
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
  tdLast: { borderRightWidth: 0 },
  tdProductName: { fontSize: 9, marginBottom: 2 },
  tdBarcode: { fontSize: 8, color: "#4B5563" },
  rightAlign: { textAlign: "right" },

  colNo: { width: "5%" },
  colDesc: { width: "35%" },
  colUnits: { width: "10%" },
  colTech: { width: "30%" },
  colFees: { width: "20%" },

  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  termsCol: { width: 400, paddingHorizontal: 20, fontFamily: "NotoSerifBengali" },
  totalsCol: { width: 220, paddingHorizontal: 20 },
  termsTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletDot: { width: 8, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 8, color: "#111827" },

  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  totalsLabel: { fontSize: 8, color: "#111827" },
  totalsValue: { fontSize: 8, color: "#111827", textAlign: "right" },
  totalsLabelStrong: { fontSize: 8, fontWeight: "bold", color: "#111827" },
  totalsValueStrong: { fontSize: 8, fontWeight: "bold", color: "#111827", textAlign: "right" },

  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    marginHorizontal: 10,
    padding: 6,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 2,
  },
  infoCell: { width: "33%", paddingHorizontal: 4 },
  infoLabel: { fontSize: 7, color: "#6B7280", fontWeight: "bold", marginBottom: 1 },
  infoValue: { fontSize: 8, color: "#111827" },

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
    paddingHorizontal: 60,
    color: "#595959",
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  footerCol: { flex: 1 },
  footerText: { fontSize: 8, color: "#111827" },
  footerTextCenter: { fontSize: 8, textAlign: "center", color: "#111827" },
  footerTextRight: { fontSize: 8, textAlign: "right", color: "#111827" },
  pageNum: { position: "absolute", fontSize: 7, bottom: 2, right: 20, color: "#6B7280" },
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
});

const fmtMoney = (n) => Number(n ?? 0).toLocaleString();

function Header({ qrDataUrl, logoUrl, service, user }) {
  const d = service;
  const invUser = d?.user_info || user || {};
  const userSettings = user?.invoice_settings || {};
  const settingsFromInvoice = invUser?.invoice_settings || {};
  const brandLight = userSettings.first_code || settingsFromInvoice.first_code || "#a9d0b8";
  const logo = logoUrl || null;

  const customer = d?.customers || {};
  const customerName = customer?.name || "Walk-in";
  const customerPhone = customer?.mobile_number || customer?.phone || "N/A";
  const customerAddress = customer?.address || "N/A";

  const dateObj = d?.created_at ? new Date(d.created_at) : null;
  const dateStr = dateObj ? `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}` : "-";

  const shopName = userSettings.shop_name || settingsFromInvoice.shop_name || invUser.outlet_name || "Outlet";
  const shopAddress = userSettings.shop_address || settingsFromInvoice.shop_address || invUser.address;
  const binNo = userSettings.bin || settingsFromInvoice.bin || "N/A";

  return (
    <View style={[styles.headerCard, { backgroundColor: brandLight }]}>
      <View style={styles.headerTopStrip} />
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.logoImageContainer}>
            <Image
              style={styles.logoImage}
              src={logo || "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"}
              width={50}
              height={50}
            />
          </View>
          <Text style={styles.headerSectionTitle}>Customer Details:</Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Name: </Text>{customerName}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Address: </Text>{customerAddress}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Number: </Text>{customerPhone}
          </Text>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.qrWrapper}>
            {qrDataUrl ? (
              <View>
                <Image style={{ width: 80, height: 80 }} src={qrDataUrl} />
                <Text style={{ fontSize: 7, color: "#6B7280", marginTop: 5, textAlign: "center" }}>
                  {d?.service_invoice_id || ""}
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 7, color: "#6B7280" }}>
                {d?.service_invoice_id || ""}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.shopName}>{shopName}</Text>
          {shopAddress && <Text style={styles.shopLine}>{shopAddress}</Text>}
          <Text style={styles.shopLine}>BIN No: {binNo}</Text>
          <Text style={styles.shopLine}>Service Date: {dateStr}</Text>
          <Text style={styles.shopLine}>Status: {d?.status || "Pending"}</Text>
        </View>
      </View>
    </View>
  );
}

function ServiceInfoRow({ service }) {
  const d = service;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>SERVICE TYPE</Text>
        <Text style={styles.infoValue}>
          {d?.service_type?.name || d?.service_type_name || `Type #${d?.service_type_id || "—"}`}
        </Text>
      </View>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>ISSUE DESCRIPTION</Text>
        <Text style={styles.infoValue}>{d?.issue_description || "—"}</Text>
      </View>
      <View style={styles.infoCell}>
        <Text style={styles.infoLabel}>CHECKING DESCRIPTION</Text>
        <Text style={styles.infoValue}>{d?.checking_description || "—"}</Text>
      </View>
    </View>
  );
}

function ItemsTable({ service }) {
  const d = service;
  const invUser = d?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const brandDark = invSet.second_code || "#5c8a6d";
  const items = d?.service_details || d?.service_products || [];
  const fees = Number(d?.fees || 0);

  return (
    <View style={styles.tableWrapper}>
      <View style={styles.tableHeaderRow}>
        <View style={[styles.colNo, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, { textAlign: "center" }]}>N°</Text>
        </View>
        <View style={[styles.colDesc, { backgroundColor: brandDark }]}>
          <Text style={styles.th}>DESCRIPTION(CODE)</Text>
        </View>
        <View style={[styles.colUnits, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, { textAlign: "center" }]}>UNITS</Text>
        </View>
        <View style={[styles.colTech, { backgroundColor: brandDark }]}>
          <Text style={styles.th}>TECHNICIANS</Text>
        </View>
        <View style={[styles.colFees, { backgroundColor: brandDark }]}>
          <Text style={[styles.th, styles.rightAlign, styles.thLast]}>FEES</Text>
        </View>
      </View>

      {items.map((item, i) => {
        const name = item.product_info?.name || `Product #${item.product_id}`;
        const barcode = item.product_info?.barcode;
        const techs = (item.technician_list || item.technicians || [])
          .map((t) => t.name)
          .join(", ") || "—";

        return (
          <View key={item.id || i} style={styles.tdRow}>
            <View style={[styles.colNo, styles.td, { textAlign: "center" }]}>
              <Text style={{ textAlign: "center" }}>{i + 1}</Text>
            </View>
            <View style={[styles.colDesc, styles.td]}>
              <Text style={styles.tdProductName}>{name}</Text>
              {barcode && <Text style={styles.tdBarcode}>Barcode: {barcode}</Text>}
            </View>
            <View style={[styles.colUnits, styles.td]}>
              <Text style={{ textAlign: "center" }}>{item.servicing_unit} Pcs</Text>
            </View>
            <View style={[styles.colTech, styles.td]}>
              <Text>{techs}</Text>
            </View>
            <View style={[styles.colFees, styles.td, styles.tdLast]}>
              <Text style={styles.rightAlign}>{i === 0 ? fmtMoney(fees) : "—"}</Text>
            </View>
          </View>
        );
      })}

      {items.length === 0 && (
        <View style={styles.tdRow}>
          <View style={[styles.colNo, styles.td]}><Text style={{ textAlign: "center" }}>1</Text></View>
          <View style={[styles.colDesc, styles.td]}><Text style={styles.tdProductName}>Service Charge</Text></View>
          <View style={[styles.colUnits, styles.td]}><Text style={{ textAlign: "center" }}>—</Text></View>
          <View style={[styles.colTech, styles.td]}><Text>—</Text></View>
          <View style={[styles.colFees, styles.td, styles.tdLast]}><Text style={styles.rightAlign}>{fmtMoney(fees)}</Text></View>
        </View>
      )}
    </View>
  );
}

function MiddleSection({ service, termsData }) {
  const d = service;
  const fees = Number(d?.fees || 0);
  const vat = Number(d?.vat || 0);
  const tax = Number(d?.tax || 0);
  const discount = Number(d?.discount || 0);
  const total = Number(d?.total || 0);
  const paid = Number(d?.paid_amount || 0);
  const due = Number(d?.due_amount || 0);

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
    const n2 = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n2) return "";
    let str = "";
    str += n2[1] != 0 ? (a[Number(n2[1])] || `${b[n2[1][0]]} ${a[n2[1][1]]}`) + "Crore " : "";
    str += n2[2] != 0 ? (a[Number(n2[2])] || `${b[n2[2][0]]} ${a[n2[2][1]]}`) + "Lakh " : "";
    str += n2[3] != 0 ? (a[Number(n2[3])] || `${b[n2[3][0]]} ${a[n2[3][1]]}`) + "Thousand " : "";
    str += n2[4] != 0 ? (a[Number(n2[4])] || `${b[n2[4][0]]} ${a[n2[4][1]]}`) + "Hundred " : "";
    str += n2[5] != 0 ? (str !== "" ? "and " : "") + (a[Number(n2[5])] || `${b[n2[5][0]]} ${a[n2[5][1]]}`) : "";
    return str.trim().toUpperCase();
  };

  const amountInWords = total > 0 ? `${numberToWords(Math.round(total))} TAKA ONLY` : "";

  return (
    <View style={styles.middleRow}>
      <View style={styles.termsCol}>
        <Text style={styles.termsTitle}>Terms & Condition</Text>
        {termsData?.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{item?.description || "-"}</Text>
          </View>
        ))}
        {amountInWords && (
          <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: "bold", color: "#6B7280", marginBottom: 2 }}>AMOUNT IN WORDS</Text>
            <Text style={{ fontSize: 8, fontWeight: "bold" }}>{amountInWords}</Text>
          </View>
        )}
      </View>

      <View style={styles.totalsCol}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Service Fees:</Text>
          <Text style={styles.totalsValue}>{fmtMoney(fees)}</Text>
        </View>
        {vat > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>VAT:</Text>
            <Text style={styles.totalsValue}>(+) {fmtMoney(vat)}</Text>
          </View>
        )}
        {tax > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Service Charge:</Text>
            <Text style={styles.totalsValue}>(+) {fmtMoney(tax)}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount:</Text>
            <Text style={styles.totalsValue}>(-) {fmtMoney(discount)}</Text>
          </View>
        )}
        <View style={[styles.totalsRow, { marginTop: 3, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 3 }]}>
          <Text style={styles.totalsLabelStrong}>Total Amount:</Text>
          <Text style={styles.totalsValueStrong}>{fmtMoney(total)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Paid Amount:</Text>
          <Text style={styles.totalsValue}>(-) {fmtMoney(paid)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={[styles.totalsLabelStrong, { color: due > 0 ? "#B91C1C" : "#059669", fontWeight: "bold" }]}>
            Due Amount:
          </Text>
          <Text style={[styles.totalsValueStrong, { color: due > 0 ? "#B91C1C" : "#059669", fontWeight: "bold" }]}>
            {fmtMoney(due)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FooterBar({ user, service }) {
  const invUser = service?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const userSettings = user?.invoice_settings || {};
  const brandDark = userSettings.second_code || invSet.second_code || "#a9d0b8";

  const hotline = invUser.phone || "N/A";
  const website = invUser.web_address || invSet.web_address || "";
  const email = invSet.addtional_email || invSet.email || invUser.email || "";
  const saleCondition = invSet?.sale_condition;

  return (
    <View style={styles.footerBar}>
      <Text style={styles.footerBarText}>{saleCondition || ""}</Text>
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

export default function ServiceInvoicePdf({ qrDataUrl, service, user, logoUrl, termsData }) {
  const d = service;
  const watermarkText = d?.user_info?.invoice_settings?.watermark_text;
  const brandLight = d?.user_info?.invoice_settings?.first_code || "#a9d0b8";

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {watermarkText && (
          <Text style={[styles.watermark, { color: brandLight }]}>{watermarkText}</Text>
        )}
        <Header qrDataUrl={qrDataUrl} logoUrl={logoUrl} service={d} user={user} />
        <ServiceInfoRow service={d} />
        <ItemsTable service={d} />
        <MiddleSection service={d} termsData={termsData} />
        <FooterBar user={user} service={d} />
        <Text
          style={styles.pageNum}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
