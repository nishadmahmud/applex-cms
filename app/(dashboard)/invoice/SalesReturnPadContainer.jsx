/* eslint-disable react/prop-types */
import React from "react";
import Barcode from "react-barcode";

const SalesReturnPadContainer = ({
  invoice,          
  termsData,
}) => {
  // ----- BASIC DATA EXTRACTION -----
  const customer = invoice?.customers || {};

  const customerName =
    customer?.name ||
    invoice?.sales.customer_name ||
    "N/A";

  const customerPhone =
    customer?.phone ||
    customer?.customer_phone ||
    "N/A";

  const customerAddress =
    customer?.address ||
    customer?.customer_address ||
    "N/A";


  const dateStr =
    invoice?.invoice_date ||
    invoice?.created_at ||
    "";
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString()
    : "";

  // ----- LINE ITEMS / TOTALS -----
  const items = invoice?.sales_details || [];

  const subTotal = items.reduce(
    (sum, item) => sum + Number(item?.return_amount ?? 0),
    0
  );

  // VAT % from user settings if present
  const vatPercent =
    invoice?.user_info?.invoice_settings?.vat ?? 0;
  const vat = (subTotal * Number(vatPercent)) / 100;

  const deliveryFee = 0;  // adjust if return has delivery fee logic
  const discount = 0;     // adjust if discount on return is needed
  const total = subTotal + vat + deliveryFee - discount;


  // try to use backend total if provided
  const backendReturnAmount = Number(invoice?.return_amount ?? 0);
  const finalTotal =
    backendReturnAmount > 0 ? backendReturnAmount : total;

  // Terms may come as termsData.data or direct array
  const termsList = Array.isArray(termsData?.data)
    ? termsData.data
    : Array.isArray(termsData)
    ? termsData
    : [];

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div className="invoice-title">SALES RETURN INVOICE</div>

      <div className="invoice-header">
        {/* LEFT - CUSTOMER */}
        <div className="header-left">
          <div className="hlabel">Customer</div>
          <div className="customer-name">{customerName}</div>
          <div className="meta">Contact: {customerPhone}</div>
        </div>

        {/* CENTER - ADDRESS */}
        <div className="header-center">
          <div className="hlabel">Address</div>
          <div className="value">{customerAddress}</div>
        </div>

        {/* RIGHT - RETURN / INVOICE INFO */}
        <div className="header-right">
          <div className="barcode">
            {invoice?.return_id && (
              <>
                <Barcode
                  displayValue={false}
                  width={2}
                  height={50}
                  value={invoice.return_id
                    .replace(/\D/g, "")
                    .slice(-4)}
                />
                <div>{invoice.return_id}</div>
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
            const discount = Number(
              item?.discount ?? 0
            );
            const qty = Number(item?.return_qty ?? 0);
            const lineTotal =
              Number(item?.return_amount ?? unitPrice * qty);

            const imeiArr = item?.product_imei || [];
            const firstImei =
              Array.isArray(imeiArr) &&
              imeiArr.length > 0
                ? imeiArr[0].imei
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
                  {discount.toLocaleString("en-IN")}
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
      {termsList.length > 0 && (
        <div className="terms">
          <h3 className="font-bold">Terms & Condition</h3>
          <ul>
            {termsList.map((t, i) => (
              <li key={i}>{t?.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SalesReturnPadContainer;