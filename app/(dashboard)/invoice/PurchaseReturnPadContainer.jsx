/* eslint-disable react/prop-types */
import React from "react";
import Barcode from "react-barcode";

const PurchaseReturnPadContainer = ({ invoice, termsData }) => {
  // Support both: full API response or just the `data` object
  const data = invoice?.data ?? invoice ?? {};

  // ----- BASIC DATA EXTRACTION -----
  // For purchase return, "vendor" is the supplier
  const vendor =
    data?.vendor ||
    data?.purchase?.vendor ||
    {};

  const vendorName =
    vendor?.name ||
    data?.purchase?.vendor_name ||
    "N/A";

  const vendorPhone =
    vendor?.mobile_number ||
    vendor?.phone ||
    data?.purchase?.vendor_phone ||
    "N/A";

  const vendorAddress =
    vendor?.address ||
    data?.purchase?.vendor?.address ||
    "N/A";

  const dateStr =
    data?.invoice_date ||
    data?.created_at ||
    data?.purchase?.created_at ||
    "";

  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString()
    : "";

  // ----- LINE ITEMS / TOTALS -----
  const items = Array.isArray(data?.purchase_details)
    ? data.purchase_details
    : [];

  const subTotal = items.reduce(
    (sum, item) => sum + Number(item?.return_amount ?? 0),
    0
  );

  // VAT % from user settings if present
  const vatPercent =
    data?.user_info?.invoice_settings?.vat ?? 0;

  const vat = (subTotal * Number(vatPercent)) / 100;

  const deliveryFee = 0; // adjust if you have delivery fee on purchase return
  const discount = 0;    // adjust if you have discount on purchase return
  const total = subTotal + vat + deliveryFee - discount;

  // Prefer backend total if present
  const backendReturnAmount = Number(data?.return_amount ?? 0);
  const finalTotal =
    backendReturnAmount > 0 ? backendReturnAmount : total;

  // Terms: external termsData + purchase_condition from settings
  const termsList = Array.isArray(termsData?.data)
    ? termsData.data
    : Array.isArray(termsData)
    ? termsData
    : [];

  const purchaseCondition =
    data?.user_info?.invoice_settings?.purchase_condition || "";

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="invoice-title">PURCHASE RETURN INVOICE</div>

      <div className="invoice-header">
        {/* LEFT - VENDOR */}
        <div className="header-left">
          <div className="hlabel">Vendor</div>
          <div className="customer-name">{vendorName}</div>
          <div className="meta">Contact: {vendorPhone}</div>
        </div>

        {/* CENTER - ADDRESS */}
        <div className="header-center">
          <div className="hlabel">Address</div>
          <div className="value">{vendorAddress}</div>
        </div>

        {/* RIGHT - RETURN / INVOICE INFO */}
        <div className="header-right">
          <div className="barcode">
            {data?.return_id && (
              <>
                <Barcode
                  displayValue={false}
                  width={2}
                  height={50}
                  value={data.return_id
                    .replace(/\D/g, "")
                    .slice(-4)}
                />
                <div>{data.return_id}</div>
              </>
            )}

            <div className="invoice-info">
              <strong>Date:</strong> {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th className="text-right">UNIT PRICE</th>
            <th className="text-center">RETURN QTY</th>
            <th className="text-center">DISCOUNT</th>
            <th className="text-right">RETURN TOTAL</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const name =
              item?.product_info?.name || "Product";

            const unitPrice = Number(
              item?.return_unit_price ?? 0
            );
            const discountValue = Number(
              item?.discount ?? 0
            );
            const qty = Number(item?.return_qty ?? 0);
            const lineTotal =
              Number(item?.return_amount ?? unitPrice * qty);

            const imeiArr = item?.product_imei || [];
            const firstImei =
              Array.isArray(imeiArr) && imeiArr.length > 0
                ? imeiArr[0]?.imei
                : null;

            return (
              <tr key={item.id}>
                <td className="name">
                  {name}
                  {firstImei && (
                    <div className="text-[13px] text-gray-600 mt-1">
                      <span className="font-bold">IMEI:</span>{" "}
                      {firstImei}
                    </div>
                  )}
                </td>
                <td className="text-right">
                  {unitPrice.toLocaleString("en-IN")}
                </td>
                <td className="text-center">
                  {qty.toLocaleString("en-IN")}
                </td>
                <td className="text-right">
                  {discountValue.toLocaleString("en-IN")}
                </td>
                <td className="text-right">
                  {lineTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}

          <tr>
            <td colSpan={3} className="text-right font-semibold">
              Total Return Amount
            </td>
            <td colSpan={2} className="text-right">
              {finalTotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===== TERMS ===== */}
      {(termsList.length > 0 || purchaseCondition) && (
        <div className="terms">
          <h3 className="font-bold">Terms &amp; Condition</h3>

          {termsList.length > 0 && (
            <ul>
              {termsList.map((t, i) => (
                <li key={i}>{t?.description ?? t}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseReturnPadContainer;