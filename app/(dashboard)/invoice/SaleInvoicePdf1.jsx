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

// ✅ REGISTER BANGLA FONT
// ✅ REGISTER BANGLA FONT
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
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    paddingTop: 35,
    paddingBottom: 60,
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
    marginTop: -35,
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
});

const fmtMoney = (n) => Number(n ?? 0).toLocaleString();

function Header({ orderId, qrDataUrl, logoUrl, invoice, user }) {
  const invUser = user || invoice?.user_info || {};
  const userSettings = user?.invoice_settings || {};
  const userInfo = invoice?.data?.user_info;
  const settingsFromInvoice = userInfo?.invoice_settings || {};
  const brandLight =
    userSettings.first_code || settingsFromInvoice.first_code || "#a9d0b8";
  const logo = logoUrl || null;
  const qrcode = qrDataUrl || null;

  const customerName =
    invoice?.data?.customer_name ||
    invoice?.delivery_customer_name ||
    "Walk-in";
  const customerPhone =
    invoice?.data?.customer_phone || invoice?.delivery_customer_phone || "N/A";
  const customerAddress =
    invoice?.data?.customer_address ||
    invoice?.delivery_customer_address ||
    "N/A";

  const d = invoice?.data.created_at
    ? new Date(invoice?.data.created_at)
    : null;
  const dateStr = d
    ? `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    : "-";

  const shopName =
    userSettings.shop_name ||
    settingsFromInvoice.shop_name ||
    invUser.outlet_name ||
    "Outlet";
  const shopAddress =
    userSettings.shop_address || settingsFromInvoice.shop_address;
  const binNo = userSettings.bin || settingsFromInvoice.bin || "N/A";
  const paymentMode = invoice?.data?.pay_mode;
  const salesPerson = invoice?.data?.saler ? invoice?.data?.saler?.name : "N/A";

  return (
    <View style={[styles.headerCard, { backgroundColor: brandLight }]}>
      <View style={[styles.headerTopStrip]} />
      <View style={styles.headerRow}>
        {/* Left: Brand + Customer */}
        <View style={styles.headerLeft}>
          <View style={styles?.logoImageContainer}>
            <Image
              style={styles.logoImage}
              src={
                logo ||
                "https://www.outletexpense.xyz/uploads/203-MD.-Fahim-Morshed/1765780585_693fac696d862.jpg"
              }
              width={50}
              height={50}
              alt={user?.invoice_settings?.shop_name || "Shop Logo"}
            />
          </View>
          <Text style={styles.headerSectionTitle}>Customer Details:</Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Name: </Text>
            {customerName || "-"}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Address: </Text>
            {customerAddress || "-"}
          </Text>
          <Text style={styles.headerLine}>
            <Text style={styles.headerLabel}>Number: </Text>
            {customerPhone || "-"}
          </Text>
          {/* ✅ Show Consignment if available, otherwise Order ID (and hide label when neither) */}
          {invoice?.data?.stead_fast_courier?.consignment_id ? (
            <Text style={styles.headerLine}>
              <Text style={styles.headerLabel}>Parcel ID: </Text>
              {invoice.data.stead_fast_courier.consignment_id}
            </Text>
          ) : null}
        </View>

        {/* Center: QR */}
        <View style={styles.headerCenter}>
          <View style={styles.qrWrapper}>
            {qrcode ? (
              // <QRCodeCanvas value='n/a'></QRCodeCanvas>
              <div className="w-20">
                <Image style={{ width: 80, height: 80 }} src={qrcode}></Image>
                <Text
                  style={{
                    fontSize: 7,
                    color: "#6B7280",
                    marginTop: 5,
                    textAlign: "center",
                  }}
                >
                  {invoice?.data?.invoice_id || ""}
                </Text>
              </div>
            ) : (
              <Text style={{ fontSize: 7, color: "#6B7280" }}>
                {invoice?.data?.invoice_id || ""}
              </Text>
            )}
          </View>
        </View>

        {/* Right: Shop info */}
        <View style={styles.headerRight}>
          <Text style={styles.shopName}>{shopName}</Text>

          {shopAddress && <Text style={styles.shopLine}>{shopAddress}</Text>}

          <Text style={styles.shopLine}>BIN No: {binNo}</Text>
          <Text style={styles.shopLine}>Sales Date: {dateStr}</Text>
          <Text style={styles.shopLine}>Payment: {paymentMode}</Text>
          <Text style={styles.shopLine}>Sales Person: {salesPerson}</Text>

          {invoice?.data?.delivery_method_id > 0 &&
            invoice?.data?.delivery_method?.type_name !== "hand-to-hand" && (
              <View style={styles.deliveryBox}>
                <Text style={styles.deliveryTitle}>• Delivery Info:</Text>

                <View style={styles.drow}>
                  <Text style={styles.label}>Method:</Text>
                  <Text>{invoice.data.delivery_method.type_name}</Text>
                </View>

                <View style={styles.drow}>
                  <Text style={styles.label}>Customer:</Text>
                  <Text>{invoice.data.delivery_customer_name || "-"}</Text>
                </View>

                <View style={styles.drow}>
                  <Text style={styles.label}>Number:</Text>
                  <Text>{invoice.data.delivery_customer_phone || "-"}</Text>
                </View>

                <View style={styles.drow}>
                  <Text style={styles.label}>Address:</Text>
                  <Text>{invoice.data.delivery_customer_address || "-"}</Text>
                </View>
              </View>
            )}
        </View>
      </View>
    </View>
  );
}

// function ItemsTable({ invoice }) {
//   const invUser = invoice?.user_info || {};
//   const invSet = invUser.invoice_settings || {};
//   const brandDark = invSet.second_code || "#5c8a6d";

//   const items = invoice?.data?.sales_details || [];

//   return (
//     <View style={styles.tableWrapper}>
//       {/* Header row */}
//       <View style={styles.tableHeaderRow}>
//         <View style={[styles.colProduct, { backgroundColor: brandDark }]}>
//           <Text style={[styles.th]}>PRODUCT NAME</Text>
//         </View>
//         <View style={[styles.colPrice, { backgroundColor: brandDark }]}>
//           <Text style={[styles.th, styles.rightAlign]}>PRICE</Text>
//         </View>
//         <View style={[styles.colQty, { backgroundColor: brandDark }]}>
//           <Text style={[styles.th, styles.rightAlign]}>QTY</Text>
//         </View>
//         <View style={[styles.colSubtotal, { backgroundColor: brandDark }]}>
//           <Text style={[styles.th, styles.rightAlign, styles.thLast]}>
//             SUBTOTAL
//           </Text>
//         </View>
//       </View>

//       {/* Map all items */}
//       {items.map((item, index) => {
//         let name = item?.product_info?.name || item?.product_name || "-";

//         // 🟢 Append variant name only if present
//         if (
//           item?.product_info?.have_product_variant ||
//           item?.have_product_variant ||
//           item?.product_variant
//         ) {
//           const variantName = item?.product_variant?.name;
//           if (variantName) {
//             name += ` - ${variantName}`; // e.g. "New T shirt in the market - Small"
//           }
//         }

//         const imeis = (item?.product_imei || [])
//           .map((i) => i.imei)
//           .filter(Boolean)
//           .join(", ");

//         const unitPrice = Number(item?.price ?? item?.sale_price ?? 0);
//         const qty = Number(item?.qty ?? 0);
//         const lineTotal = unitPrice * qty;

//         return (
//           <View key={index} style={styles.tdRow}>
//             <View style={[styles.colProduct, styles.td]}>
//               <Text style={styles.tdProductName}>{name || "-"}</Text>
//               {imeis ? (
//                 <Text style={styles.tdImei}>IMEI: {imeis || "-"}</Text>
//               ) : null}
//             </View>

//             <View style={[styles.colPrice, styles.td]}>
//               <Text style={[styles.rightAlign]}>
//                 {fmtMoney(unitPrice || 0)}
//               </Text>
//             </View>

//             <View style={[styles.colQty, styles.td]}>
//               <Text style={[styles.rightAlign]}>{qty}</Text>
//             </View>

//             <View style={[styles.colSubtotal, styles.td, styles.tdLast]}>
//               <Text style={[styles.rightAlign]}>
//                 {fmtMoney(lineTotal || 0)}
//               </Text>
//             </View>
//           </View>
//         );
//       })}
//     </View>
//   );
// }

function ItemsTable({ invoice }) {
  const invUser = invoice?.user_info || {};
  const invSet = invUser.invoice_settings || {};
  const brandDark = invSet.second_code || "#5c8a6d";

  const items = invoice?.data?.sales_details || [];
  const exchangeImeis = invoice?.data?.exchange_imeis || [];

  return (
    <View style={styles.tableWrapper}>
      {/* Header row */}
      <View style={styles.tableHeaderRow}>
        <View style={[styles.colProduct, { backgroundColor: brandDark }]}>
          <Text style={[styles.th]}>PRODUCT NAME</Text>
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

      {/* Normal items */}
      {items.map((item, index) => {
        let name = item?.product_info?.name || item?.product_name || "-";

        if (
          item?.product_info?.have_product_variant ||
          item?.have_product_variant ||
          item?.product_variant
        ) {
          const variant = item?.product_variant?.name;
          if (variant) name += ` - ${variant}`;
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

        const unitPrice = Number(item?.price ?? item?.sale_price ?? 0);
        const qty = Number(item?.qty ?? 0);
        const lineTotal = unitPrice * qty;

        return (
          <View key={index} style={styles.tdRow}>
            <View style={[styles.colProduct, styles.td]}>
              <Text style={styles.tdProductName}>{name}</Text>
              {imeis ? (
                <Text style={styles.tdImei}>IMEI: {imeis}</Text>
              ) : item?.product_info?.barcode ? (
                <Text style={styles.tdImei}>
                  Barcode: {item.product_info.barcode}
                </Text>
              ) : null}
            </View>

            <View style={[styles.colPrice, styles.td]}>
              <Text style={[styles.rightAlign]}>{fmtMoney(unitPrice)}</Text>
            </View>

            <View style={[styles.colQty, styles.td]}>
              <Text style={[styles.rightAlign]}>{qty}</Text>
            </View>

            <View style={[styles.colSubtotal, styles.td, styles.tdLast]}>
              <Text style={[styles.rightAlign]}>{fmtMoney(lineTotal)}</Text>
            </View>
          </View>
        );
      })}

      {/* ✅ Exchange IMEIs (only if exist) */}
      {Array.isArray(exchangeImeis) &&
        exchangeImeis.length > 0 &&
        exchangeImeis.map((ex, index) => (
          <View
            key={`exchange-${ex.id}`}
            style={[
              styles.tdRow,
              { backgroundColor: "#FEE2E2" } /* light red bg */,
            ]}
          >
            <View style={[styles.colProduct, styles.td]}>
              <Text
                style={[
                  styles.tdProductName,
                  { color: "#B91C1C", fontWeight: 600 },
                ]}
              >
                {ex.product_name}
              </Text>
              <Text style={[styles.tdImei, { color: "#DC2626" }]}>
                IMEI: {ex.imei} (Exchanged Product)
              </Text>
            </View>

            <View style={[styles.colPrice, styles.td]}>
              <Text style={[styles.rightAlign, { color: "#B91C1C" }]}>
                {fmtMoney(ex.purchase_price || 0)}
              </Text>
            </View>

            <View style={[styles.colQty, styles.td]}>
              <Text style={[styles.rightAlign, { color: "#B91C1C" }]}>1</Text>
            </View>

            <View style={[styles.colSubtotal, styles.td, styles.tdLast]}>
              <Text style={[styles.rightAlign, { color: "#B91C1C" }]}>
                (-) {fmtMoney(ex.purchase_price || 0)}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
}

function MiddleSection({ invoice, termsData }) {
  const invUser = invoice?.data.user_info || {};
  const invSet = invUser.invoice_settings || {};
  const subTotal = Number(invoice?.data.sub_total ?? 0);
  const discount = Number(invoice?.data.discount ?? 0);
  const vatPercent = Number(invSet.vat ?? invoice?.data.vat ?? 0);
  const vatAmount = Number(((subTotal - discount) * vatPercent) / 100);
  const deliveryFee = Number(invoice?.data.delivery_fee ?? 0);
  const paidAmount = Number(invoice?.data.paid_amount ?? 0);
  const exchangeImeis = invoice?.data?.exchange_imeis || [];

  // 🧮 Calculate exchange total
  const exchangeTotal = exchangeImeis.reduce(
    (sum, ex) => sum + Number(ex?.purchase_price || 0),
    0,
  );

  // Compute adjusted subtotal only if exchange exists
  const adjustedSubTotal =
    exchangeTotal > 0 ? subTotal - exchangeTotal : subTotal;

  // --------------------------------------
  // ✅ Cash Change Logic (match SaleInvoice)
  // --------------------------------------
  const totalAmount = adjustedSubTotal - discount + vatAmount + deliveryFee;

  const rawChange = invoice?.data?.cash_change;
  const hasChange =
    rawChange !== null &&
    rawChange !== undefined &&
    rawChange !== "" &&
    Number(rawChange) > 0;

  const changeAmount = hasChange ? Number(rawChange) : 0;

  // If customer overpaid → due = 0, else normal formula
  const dueAmount = hasChange ? 0 : Math.max(totalAmount - paidAmount, 0);

  return (
    <>
      <View style={styles.middleRow}>
        {/* Terms & Conditions */}
        <View style={styles.termsCol}>
          <Text style={styles.termsTitle}>Terms & Condition</Text>
          {termsData?.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{item?.description || "-"}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCol}>
          {/* Subtotal */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sub-total:</Text>
            <Text style={styles.totalsValue}>{fmtMoney(subTotal)}</Text>
          </View>

          {/* ✅ Show only if exchange products exist */}
          {exchangeTotal > 0 && (
            <>
              <View style={[styles.totalsRow]}>
                <Text
                  style={[
                    styles.totalsLabel,
                    { color: "#B91C1C", fontWeight: "bold" },
                  ]}
                >
                  (-) Exchange Value:
                </Text>
                <Text style={[styles.totalsValue, { color: "#B91C1C" }]}>
                  {fmtMoney(exchangeTotal)}
                </Text>
              </View>

              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Adjusted Sub-total:</Text>
                <Text style={styles.totalsValue}>
                  {fmtMoney(adjustedSubTotal)}
                </Text>
              </View>
            </>
          )}

          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount:</Text>
            <Text style={styles.totalsValue}>(-) {fmtMoney(discount)}</Text>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Vat ({vatPercent || 0}%):</Text>
            <Text style={styles.totalsValue}>(+) {fmtMoney(vatAmount)}</Text>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Delivery Fee:</Text>
            <Text style={styles.totalsValue}>(+) {fmtMoney(deliveryFee)}</Text>
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
              {fmtMoney(totalAmount)}
            </Text>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Paid Amount:</Text>
            <Text style={styles.totalsValue}>(-) {fmtMoney(paidAmount)}</Text>
          </View>

          {/* ✅ Either Change or Due, exactly like main SaleInvoice */}
          {changeAmount > 0 ? (
            <View style={styles.totalsRow}>
              <Text
                style={[
                  styles.totalsLabelStrong,
                  { color: "#059669", fontWeight: "bold" },
                ]}
              >
                Change Amount:
              </Text>
              <Text
                style={[
                  styles.totalsValueStrong,
                  { color: "#059669", fontWeight: "bold" },
                ]}
              >
                {fmtMoney(changeAmount)}
              </Text>
            </View>
          ) : (
            <View style={styles.totalsRow}>
              <Text
                style={[
                  styles.totalsLabelStrong,
                  { color: "#B91C1C", fontWeight: "bold" },
                ]}
              >
                Due Amount:
              </Text>
              <Text
                style={[
                  styles.totalsValueStrong,
                  { color: "#B91C1C", fontWeight: "bold" },
                ]}
              >
                {fmtMoney(dueAmount)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

function FooterBar({ user, invoice }) {
  const invUser = invoice?.data?.user_info || {};
  const invSet = invUser?.invoice_settings || {};
  const userSettings = user?.invoice_settings || {};
  const brandDark = userSettings.second_code || "#a9d0b8";

  const hotline = invUser.phone || "N/A";
  const website = invUser.web_address || invSet.web_address || "";
  const email = invSet.addtional_email || invSet.email || invUser.email || "";
  const saleCondition = invSet?.sale_condition;

  return (
    <View style={[styles.footerBar]}>
      {/* Bottom note (same as screenshot text) */}
      <Text style={styles.footerBarText}>{saleCondition || ""}</Text>

      <View style={[styles.footerBar, { backgroundColor: brandDark }]} fixed>
        <View style={styles.footerCol}>
          <Text style={styles.footerText}>Hotline: {hotline || "-"}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerTextCenter}>{website || "-"}</Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerTextRight}>E-Mail: {email || "-"}</Text>
        </View>
      </View>
    </View>
  );
}

// ----- MAIN DOCUMENT -----
export default function SaleInvoicePdf1({
  orderId,
  qrDataUrl,
  invoice,
  user,
  qrImage,
  barcodeImage,
  termsData,
  logoUrl,
}) {
  const inv = invoice || {};
  const wattermark = inv?.data?.user_info.invoice_settings.watermark_text;
  const brandLight =
    inv?.data?.user_info?.invoice_settings?.first_code || "#a9d0b8";
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <Text style={[styles.watermark, { color: brandLight }]}>
          {wattermark}
        </Text>

        <Header
          orderId={orderId}
          qrDataUrl={qrDataUrl}
          logoUrl={logoUrl}
          invoice={inv}
          user={user}
          qrImage={qrImage}
          barcodeImage={barcodeImage}
        />
        <ItemsTable invoice={inv} />
        <MiddleSection invoice={inv} termsData={termsData} />
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
