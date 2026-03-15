/* eslint-disable react/prop-types */
import React from "react";
import { QRCodeCanvas } from "qrcode.react";

// Helper for "Amount in words"
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

  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";

  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh "
      : "";
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

const SalesPadContainer = ({
  invoice,
  formatProductName,
  subTotal,
  paid,
  due,
  discount,
  total,
  deliveryFee,
  userSettings,
  settingsFromInvoice,
  vat,
  termsData,
  baseUrl,
}) => {
  const exchangeImeis = invoice?.data?.exchange_imeis || [];

  // Calculate final due (handling change amount)
  const rawChange = invoice?.data?.cash_change;
  const hasChange = Number(rawChange) > 0;
  const changeAmount = hasChange ? Number(rawChange) : 0;
  const finalDue = hasChange ? 0 : due;
  const finalPaid = hasChange ? (paid - changeAmount) : paid;

  // Determine Gross Total
  const grossTotal = total;

  // QR Code URL Construction (ArcticERP)
  // URL Format: https://www.arcticerp.com/{SHOP_NAME}/arc_online.php?sc={SHOP_CODE}&inv={INVOICE_ID}
  const shopNameSlug = userSettings?.shop_name ? userSettings.shop_name.toLowerCase().replace(/\s+/g, '') : "dizmo";
  const shopCode = userSettings?.shop_code || "NWFJX3"; // Fallback to example code if not found
  const invoiceId = invoice?.data?.invoice_id || "INV";

  const qrValue = `https://www.arcticerp.com/${shopNameSlug}/arc_online.php?sc=${shopCode}&inv=${invoiceId}`;

  return (
    <div className="p-4 font-sans text-sm text-black leading-relaxed flex flex-col min-h-[900px] relative">
      {/* Top Content (Header, Table, Summary) */}
      <div className="flex-1">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-xl uppercase tracking-wider mb-2 bg-gray-100 py-3 border border-black/10">Sales Invoice</h1>
        </div>

        <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
          {/* Customer Info */}
          <div className="w-1/2 pr-4">
            <h3 className="font-bold mb-2 text-gray-700 uppercase text-xs tracking-wide">Customer</h3>
            <div className="font-bold text-base mb-1.5">
              {invoice?.data?.customer_name || invoice?.delivery_customer_name || "N/A"}
            </div>
            <div className="text-xs text-gray-800">Contact: <span className="font-semibold">{invoice?.data?.customer_phone || invoice?.delivery_customer_phone || "N/A"}</span></div>
          </div>

          {/* Address Info */}
          <div className="w-1/2 text-right pl-4">
            <h3 className="font-bold mb-2 text-gray-700 uppercase text-xs tracking-wide">Address</h3>
            <div className="text-xs mb-1.5 text-gray-800">
              {invoice?.data?.customer_address || invoice?.data?.delivery_customer_address || "N/A"}
            </div>
            <div className="mt-2 text-xs bg-gray-50 inline-block px-3 py-1.5 rounded border border-gray-100">
              Date: <span className="font-bold">{invoice?.data?.created_at ? new Date(invoice.data.created_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : ""}</span>
            </div>
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <table className="w-full border-collapse border border-gray-300 mb-8 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-center w-[5%] font-bold uppercase text-gray-700">N°</th>
              <th className="border border-gray-300 px-3 py-2 text-left w-[45%] font-bold uppercase text-gray-700">Description(Code)</th>
              <th className="border border-gray-300 px-3 py-2 text-right w-[15%] font-bold uppercase text-gray-700">Price</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-[10%] font-bold uppercase text-gray-700">Qty</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-[10%] font-bold uppercase text-gray-700">Dis</th>
              <th className="border border-gray-300 px-3 py-2 text-right w-[15%] font-bold uppercase text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Sales Details */}
            {invoice?.data?.sales_details?.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-3 py-2 text-center text-gray-800">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <div className="font-bold text-gray-900 mb-1">{formatProductName(item)}</div>
                  {/* IMEI */}
                  {Array.isArray(item.product_imei) && item.product_imei.length > 0 && (
                    <div className="text-[10px] text-gray-600 italic">
                      IMEI: {item.product_imei[0].imei}
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap font-medium text-gray-800">
                  {Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap text-gray-800">
                  {item.qty} Pcs
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center text-gray-800">
                  -
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold whitespace-nowrap text-gray-900">
                  {(item.price * item.qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}

            {/* Exchange Items */}
            {Array.isArray(exchangeImeis) &&
              exchangeImeis.length > 0 &&
              exchangeImeis.map((ex, index) => (
                <tr key={`exchange-${ex.id}`} className="bg-red-50 text-red-700">
                  <td className="border border-gray-300 px-3 py-2 text-center">Ex</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="font-semibold mb-1">{ex.product_name}</div>
                    <div className="text-[10px] italic">
                      IMEI: {ex.imei} (Exchange)
                    </div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap">
                    {Number(ex.purchase_price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center whitespace-nowrap">
                    1 Pcs
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap">
                    (-){Number(ex.purchase_price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ===== FOOTER LAYOUT ===== */}
        <div className="flex border border-gray-300 mb-8 shadow-sm break-inside-avoid text-xs">
          {/* LEFT: Transaction Details */}
          <div className="w-[60%] border-r border-gray-300 bg-gray-50/20">
            <div className="bg-gray-100 font-bold px-4 py-2 border-b border-gray-300 text-center uppercase tracking-wider text-gray-700">
              Transaction Details
            </div>
            <div className="p-4 space-y-2">
              {/* Check multiple payments */}
              {invoice?.data?.multiple_payment?.length > 0 ? (
                invoice.data.multiple_payment.map((pay, i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-2 border rounded border-gray-200">
                    <span className="font-medium text-gray-700">{pay?.payment_type?.type_name || "Payment"}</span>
                    <span className="font-bold text-gray-900">{Number(pay.payment_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))
              ) : (
                /* Fallback */
                <div className="flex justify-between items-center bg-white p-2 border rounded border-gray-200">
                  <span className="font-medium text-gray-700">{invoice?.data?.pay_mode || "Cash"}</span>
                  <span className="font-bold text-gray-900">{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Totals */}
          <div className="w-[40%] bg-white">
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="font-bold text-gray-600">Sub Total</span>
              <span className="font-bold">{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            {vat > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="font-bold text-gray-600">VAT ({userSettings?.vat}%)</span>
                <span>{vat.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="font-bold text-gray-600">Delivery</span>
                <span>{deliveryFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between px-4 py-2 border-b border-gray-300">
                <span className="font-bold text-gray-600">Discount</span>
                <span>(-){discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3 border-b border-gray-300 bg-gray-100">
              <span className="font-bold text-gray-800 uppercase tracking-wide self-center">Gross Total</span>
              <span className="font-bold text-lg">{grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b border-gray-300">
              <span className="font-bold text-gray-600">Paid Amount</span>
              <span className="font-bold">{finalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between px-4 py-2 font-bold bg-gray-50">
              <span>Outstanding</span>
              <span className={finalDue > 0 ? "text-red-600" : "text-green-600"}>
                {finalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Amount In Words */}
        <div className="mb-6 text-xs bg-gray-50 p-3 border border-gray-200 rounded shadow-sm">
          <span className="font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Amount in words</span>
          <span className="uppercase font-bold tracking-wide text-gray-900 text-sm">{numberToWords(Math.round(total))} TAKA ONLY</span>
        </div>

        {/* Terms */}
        <div className="mb-8">
          <h3 className="font-bold mb-2 underline underline-offset-4 text-gray-800 uppercase text-[10px] tracking-widest">Terms & Conditions</h3>
          {termsData?.data && termsData.data.length > 0 ? (
            <ul className="list-disc pl-4 text-[11px] text-gray-700 space-y-1 leading-relaxed">
              {termsData.data.map((t, i) => (
                <li key={i}>{t.description}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* QR Code & Signatures */}
        <div className="flex justify-between items-end mt-16 mb-8 align-bottom">
          <div className="text-center w-1/3">
            <div className="border-t border-gray-300 w-3/4 mx-auto pt-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              Customer Signature
            </div>
          </div>

          <div className="text-center w-1/3 flex justify-center">
            <QRCodeCanvas
              value={qrValue}
              size={90}
              level={"H"}
            />
          </div>

          <div className="text-center w-1/3">
            <div className="border-t border-gray-300 w-3/4 mx-auto pt-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              Authorized Signature
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM FOOTER ===== */}
      <div className="border-t border-gray-200 pt-1 text-center text-[10px] text-gray-400 mt-auto">
        <span className="font-semibold text-gray-500">
          {userSettings?.shop_name || settingsFromInvoice?.shop_name || "Shop Name"}.
        </span>{" "}
        © {new Date().getFullYear()}
      </div>

    </div>
  );
};

export default SalesPadContainer;
