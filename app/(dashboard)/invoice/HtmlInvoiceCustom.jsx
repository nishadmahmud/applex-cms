"use client";
import React from "react";
import "./htmlInvoiceCustom.css";
import { QRCodeSVG as QRCode } from "qrcode.react";

const HtmlInvoiceCustom = ({
  invoice,
  invoiceSetting,
  invoiceImeis,
  inputs,
  formattedDateTime,
  totalPricePrintCustomize,
  totalItemsPrintCustomize,
  styles,
  totalPrice,
  totalQty,
  BASE_URL,
  exChangeImeis,
}) => {
  console.log("HtmlInvoiceCustom props:", {
    totalPricePrintCustomize,
    invoice,
    invoiceSetting,
  });

  const formatPrice = (v) => Number(v || 0);

  const grandTotal = parseFloat(
    (
      Number(totalPrice) +
      Number(invoice?.vat || 0) +
      Number(invoice?.tax || 0) +
      Number(invoice?.delivery_fee || 0)
    ).toFixed(2),
  );
  const paidAmount = Number(
    invoice.paid_amount && invoice.paid_amount !== 0 ? invoice.paid_amount : 0,
  );
  const dueAmount = grandTotal - paidAmount;

  const isFullyPaid = dueAmount === 0;
  const isFullyDue = paidAmount === 0;
  const isPartiallyPaid = paidAmount > 0;

  return (
    <div className="">
      <div
        id="pdfConentAreasCustomize"
        className="mx-auto p-8 bg-white pdfConentAreasCustomize rounded-md shadow-sm"
      >
        {/* Header */}
        <div className="relative mb-6">
          <div className="w-full bg-gray-800 relative h-28 overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              {/* Logo Section */}
              <div
                // className="relative h-[28rem] border-orange-600 w-[26rem] bg-black transform p-4"
                className="relative h-[35rem] w-[35rem] transform"
                style={{
                  backgroundColor: invoiceSetting?.second_code || "black",
                  borderColor: invoiceSetting?.first_code || "orange",
                  clipPath: "polygon(100% 0px, 90% -2%, 0% 125%, 0px 0px)",
                  borderWidth: "1px", // Adjust if needed
                }}
              >
                <div className="text-white text-2xl font-bold tracking-wider p-2 flex items-center gap-2">
                  {/* {invoiceSetting?.shop_name || "YOUR LOGO"} */}
                  <img
                    src={invoiceSetting?.shop_logo}
                    alt="Shop Logo"
                    className="w-[50px] sm:w-[70px] md:w-[90px] object-contain print:block"
                  />
                  <p className="text-white text-lg tracking-widest mt-1 p-2 ">
                    {invoiceSetting?.shop_name || ""}
                  </p>
                </div>
              </div>

              <div
                className=" absolute left-52 h-3 -rotate-[58deg] w-80 z-10"
                style={{
                  backgroundColor: invoiceSetting?.first_code || "orange",
                }}
              ></div>
              <div
                className="absolute top-[6.3rem] h-3 w-[19rem]"
                style={{
                  backgroundColor: invoiceSetting?.first_code || "orange",
                }}
              ></div>

              {/* Invoice header (top‑right corner) */}
              <div className="flex flex-col items-end justify-start pr-6 pt-6 space-y-1">
                <h2
                  className="text-[26px] font-bold tracking-widest uppercase"
                  style={{ color: invoiceSetting?.first_code || "#047857" }}
                >
                  INVOICE
                </h2>
                <p
                  className="text-sm font-medium text-gray-100 bg-opacity-50 bg-black px-3 py-1 rounded-md tracking-wider"
                  style={{
                    letterSpacing: "0.08em",
                    background: invoiceSetting?.second_code
                      ? invoiceSetting.second_code
                      : "rgba(0,0,0,0.35)",
                    paddingRight: "14px",
                  }}
                >
                  {invoice.invoice_id}
                </p>
              </div>
            </div>

            {/* Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full h-4 bg-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-1/3 h-full bg-orange-300 -z-10 transform skew-x-12 origin-bottom-right" />
        </div>

        {/* Invoice Details */}
        {/* ================= Invoice Details (balanced) ================= */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          {/* ---- Invoice To ---- */}
          <div className="flex flex-col justify-start items-start text-sm leading-relaxed pl-8">
            <h3
              className="text-white font-semibold text-base px-3 py-1 rounded-md mb-3"
              style={{
                backgroundColor: invoiceSetting?.second_code || "#047857",
                borderLeft: `4px solid ${invoiceSetting?.first_code || "#f97316"}`,
              }}
            >
              Invoice To:
            </h3>

            <div className="space-y-1 mt-1 w-full max-w-[220px] text-gray-700">
              <p className="font-semibold text-black">
                {invoice.customer_name}
              </p>
              <p>
                <strong>Phone:</strong> {invoice.country_code}
                {invoice.customer_phone}
              </p>
              <p className="leading-snug">
                <strong>Customer Address:</strong> {invoice.customer_address}
              </p>
              <p>
                <strong>Customer ID:</strong> {invoice.customer_id}
              </p>

              {invoice.user_id === 163 ||
                invoice.user_id === 190 ||
                invoice.user_id == 191 ? (
                <p>
                  <strong>Vendor:</strong>{" "}
                  {invoice?.purchases_vendor_names?.join(", ")}
                </p>
              ) : null}

              {invoice.delivery_method?.type_name?.toLowerCase() !==
                "hand-to-hand" && (
                  <p>
                    <strong>Delivery Company:</strong>{" "}
                    {invoice.delivery_method?.delivery_infos[0]?.company_name}
                  </p>
                )}

              {invoice?.stead_fast_courier && (
                <div className="space-y-0.5">
                  <p>
                    <strong>Consignment ID:</strong>{" "}
                    {invoice.stead_fast_courier.consignment_id}
                  </p>
                  <p>
                    <strong>Tracking Code:</strong>{" "}
                    {invoice.stead_fast_courier.tracking_code}
                  </p>
                </div>
              )}

              {invoice.remarks && invoice.remarks.trim() !== "" && (
                <p>
                  <strong>Remarks:</strong> {invoice.remarks}
                </p>
              )}
            </div>
          </div>

          {/* ---- QR Code (center) ---- */}
          <div className="flex justify-center items-start pt-8">
            <QRCode
              className="object-contain"
              value={BASE_URL + "/invoice-view/" + invoice?.invoice_id}
              size={100}
            />
          </div>

          {/* ---- Invoice From ---- */}
          <div className="flex flex-col justify-start items-end text-sm leading-relaxed pr-8">
            <h3
              className="text-white font-semibold text-base px-3 py-1 rounded-md mb-3"
              style={{
                backgroundColor: invoiceSetting?.second_code || "#047857",
                borderLeft: `4px solid ${invoiceSetting?.first_code || "#f97316"}`,
              }}
            >
              Invoice From:
            </h3>

            <div className="text-right space-y-1 max-w-[220px] text-gray-700">
              <p className="font-semibold text-black">
                {invoiceSetting?.shop_name}
              </p>
              <p>
                <strong>Phone:</strong>
                {invoiceSetting?.mobile_number || invoice?.user_info?.phone}
              </p>
              <p className="leading-snug">
                <strong>Address:</strong> {invoice?.user_info?.address}
              </p>

              {invoice.delivery_method?.type_name?.toLowerCase() !==
                "hand-to-hand" && (
                  <div className="mt-1 space-y-0.5">
                    <p>
                      <strong>Receiver Name:</strong>{" "}
                      {invoice.delivery_customer_name}
                    </p>
                    <p>
                      <strong>Receiver Phone:</strong>{" "}
                      {invoice.delivery_customer_phone}
                    </p>
                    <p>
                      <strong>Receiver Address:</strong>{" "}
                      {invoice.delivery_customer_address}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="text-sm"
                style={{
                  backgroundColor: invoiceSetting?.first_code || "orange",
                }}
              >
                <th className="border-r-4 border-white text-center py-2 text-white">
                  #
                </th>
                <th className="border-r-4 border-white text-center py-2 text-white">
                  DESCRIPTION
                </th>
                <th className="border-r-4 border-white text-center py-2 text-white">
                  WARRANTY
                </th>
                <th className="border-r-4 border-white text-center py-2 text-white">
                  QTY
                </th>
                <th className="border-r-4 border-white text-center py-2 text-white">
                  PRICE
                </th>
                <th className="border-r-4 border-white text-center py-2 text-white">
                  TOTAL
                </th>
              </tr>
            </thead>

            <tbody className="divide-y-1 font-nunito font-semibold">
              {(() => {
                let rowCounter = 0;
                const processedProductIds = new Set();
                let subtotalPrice = 0;
                let exchangeTotalPrice = 0;

                // Sales Rows
                const salesRows = invoice?.sales_details?.map((item) => {
                  const findImeis = invoiceImeis.filter(
                    (imei) => imei.product_id === item.product_id,
                  );
                  if (findImeis.length > 0) {
                    if (processedProductIds.has(item.product_id)) {
                      return null;
                    }

                    processedProductIds.add(item.product_id);
                  }
                  if (findImeis.length > 0) {
                    const qty = findImeis.length;
                    totalItemsPrintCustomize += qty;
                    const itemSubtotal = findImeis.reduce(
                      (acc, prod) => acc + prod.sale_price,
                      0,
                    );
                    subtotalPrice += itemSubtotal;
                  } else {
                    const itemSubtotal = item.qty * item.price;
                    subtotalPrice += itemSubtotal;
                    totalQty += Number(item.qty);
                    totalItemsPrintCustomize += 1;
                  }

                  const getWarrantyName = (prodId) => {
                    const wItem = invoice?.data?.defaultwarranties?.find(
                      (w) => w.product_id === prodId
                    );
                    return wItem?.warranty?.name ? ` (${wItem.warranty.name})` : "";
                  };

                  return findImeis.length > 0 ? (
                    findImeis.map((imei, index) => (
                      <tr
                        key={imei.id}
                        className="text-sm border-b-2 border-gray-200"
                      >
                        <td className=" px-4 text-center">{++rowCounter}</td>
                        <td className="py-1 px-4">
                          {/* {imei?.product_name} {imei?.optional_name}{" "}
                            {imei?.color}{" "}
                            {imei?.storage ? `${imei.storage}GB` : ""}{" "}
                            {imei?.battery_life ? `BH-${imei.battery_life}%` : ""}{" "}
                            {imei?.regeion} */}
                          {`${imei?.product_name || ""} ${imei?.color || ""} ${imei?.storage ? imei.storage + " GB" : ""
                            } - ${imei?.region || ""} ${imei?.battery_life
                              ? `(BH-${imei.battery_life}%)`
                              : ""
                            } ${getWarrantyName(imei.product_id)}`}

                          <br />
                          <span className="text-[10px]">{imei?.imei}</span>
                        </td>
                        <td className="py-1 px-4 text-center">
                          {invoice.defaultwarranties?.map(
                            (warrantyItem) =>
                              warrantyItem.invoice_id === invoice.invoice_id &&
                              warrantyItem.product_id === item.product_id &&
                              (warrantyItem.warranty_id == null ? (
                                <span key={warrantyItem.id}>
                                  {warrantyItem.default_warranties_count || ""}{" "}
                                  {item.product_info.warrenty || ""}
                                </span>
                              ) : (
                                <span key={warrantyItem.id}>
                                  {warrantyItem.warranty?.warranties_count ||
                                    ""}{" "}
                                  {warrantyItem.warranty?.name || ""}
                                </span>
                              )),
                          )}
                        </td>
                        <td className="py-1 px-4 text-center">1</td>
                        <td className="py-1 px-4 text-right">
                          {Intl.NumberFormat("en-IN").format(
                            formatPrice(imei.sale_price),
                          )}
                        </td>
                        <td className="py-1 px-4 text-right">
                          {Intl.NumberFormat("en-IN").format(
                            formatPrice(imei.sale_price),
                          )}
                          {invoiceSetting?.currency_info?.code || " BDT"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr
                      key={item.id}
                      className="text-sm border-b-2 border-gray-200"
                    >
                      <td className="py-1 px-4 text-center">{++rowCounter}</td>
                      <td className="py-1 px-4">
                        {item.product_info.name}
                        <br />
                        <span className="text-[10px]">
                          {item.product_info.serial}
                        </span>
                        <span className="text-[13px]">
                          {item?.product_variant?.name
                            ? item?.product_variant?.name
                            : ""}
                        </span>
                        {getWarrantyName(item.product_id)}
                      </td>
                      <td className="py-1 px-4 text-center">
                        {invoice.defaultwarranties?.map(
                          (warrantyItem) =>
                            warrantyItem.invoice_id === invoice.invoice_id &&
                            warrantyItem.product_id === item.product_id &&
                            (warrantyItem.warranty_id == null ? (
                              <span key={warrantyItem.id}>
                                {warrantyItem.default_warranties_count || ""}{" "}
                                {item.product_info.warrenty || ""}
                              </span>
                            ) : (
                              <span key={warrantyItem.id}>
                                {warrantyItem.warranty?.warranties_count || ""}{" "}
                                {warrantyItem.warranty?.name || ""}
                              </span>
                            )),
                        )}
                      </td>
                      <td className="py-1 px-4 text-center">{item.qty}</td>
                      <td className="py-1 px-4 text-right">
                        {Intl.NumberFormat("en-IN").format(item.price)}
                      </td>
                      <td className="py-1 px-4 text-right">
                        {Intl.NumberFormat("en-IN").format(
                          formatPrice(item.qty * item.price),
                        )}{" "}
                        {invoiceSetting?.currency_info?.code || " BDT"}
                      </td>
                    </tr>
                  );
                });

                // Exchange Rows
                const exchangeRows = exChangeImeis?.map((exchangeItem) => {
                  exchangeTotalPrice += Number(
                    exchangeItem.purchase_price || 0,
                  );

                  return (
                    <tr
                      key={`exchange-${exchangeItem.id}`}
                      className="text-sm border-b-2 border-gray-200 text-red-500"
                    >
                      <td className="py-1 px-4 text-center">{++rowCounter}</td>
                      <td className="py-1 px-4">
                        {/* {exchangeItem.product_name}{" "}
                        {exchangeItem?.ram ? exchangeItem?.ram : ""}{" "}
                        {exchangeItem?.storage ? exchangeItem?.storage : ""}{" "}
                        {exchangeItem?.battery_life
                          ? exchangeItem?.battery_life
                          : ""} */}
                        {`${exchangeItem?.product_name || ""} ${exchangeItem?.color ? exchangeItem.color : ""
                          }  - ${exchangeItem?.regeion || ""} ${exchangeItem?.battery_life
                            ? `(BH-${exchangeItem.battery_life}%)`
                            : ""
                          }`}
                        <br />
                        <span className="text-[10px]">
                          {exchangeItem.imei || "N/A"}
                        </span>
                        <span className="text-[10px]">
                          {" "}
                          (Exchanged Product)
                        </span>
                      </td>
                      <td className="py-1 px-4 text-center">
                        {exchangeItem.optional_name || ""}
                      </td>
                      <td className="py-1 px-4 text-center">{""}</td>
                      <td className="py-1 px-4 text-right">
                        {Intl.NumberFormat("en-IN").format(
                          formatPrice(exchangeItem.purchase_price) || 0,
                        )}
                      </td>
                      <td className="py-1 px-4 text-right">
                        {Intl.NumberFormat("en-IN").format(
                          formatPrice(exchangeItem.purchase_price) || 0,
                        )}
                        {invoiceSetting?.currency_info?.code || "BDT"}
                      </td>
                    </tr>
                  );
                });

                totalPricePrintCustomize = subtotalPrice - exchangeTotalPrice;

                return [...salesRows, ...exchangeRows];
              })()}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="mt-3 flex justify-between gap-8 px-4">
          {/* Left: Paid By Section */}
          <div className="flex-1 relative">
            {invoice?.multiple_payment?.length > 0 ? (
              <div>
                {(() => {
                  const grandTotal = parseFloat(
                    (
                      Number(totalPrice) +
                      Number(invoice?.vat || 0) +
                      Number(invoice?.tax || 0) +
                      Number(invoice?.delivery_fee || 0)
                    ).toFixed(2),
                  );
                  const paidAmount = Number(
                    invoice.paid_amount && invoice.paid_amount !== 0
                      ? invoice.paid_amount
                      : 0,
                  );
                  const dueAmount = grandTotal - paidAmount;

                  const isFullyPaid = dueAmount === 0;
                  const isFullyDue = paidAmount === 0;
                  const isPartiallyPaid = paidAmount > 0;

                  return (
                    <span
                      style={{
                        letterSpacing: "0.08em",
                        transform: "rotate(-45deg)",
                        display: "inline-block",
                        position: "absolute",
                        opacity: 1,
                        fontSize: "14px",
                        color: "gray",
                        top: "50%",
                        left: "50%",
                        transformOrigin: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isFullyDue ? (
                        "The amount is fully due"
                      ) : (
                        <>
                          Paid by{" "}
                          {invoice?.multiple_payment
                            ?.map((payment) => payment.payment_type.type_name)
                            .join(", ")
                            .replace(/, ([^,]*)$/, " and $1")}{" "}
                          {isFullyPaid ? "" : "Partially"}
                        </>
                      )}
                    </span>
                  );
                })()}
              </div>
            ) : (
              <span>No payment information available</span>
            )}
          </div>

          {/* Right: Subtotal Section */}
          <div className="flex-1 text-right">
            <p className="flex justify-between">
              <span className="font-semibold font-nunito">Subtotal:</span>
              <span className="font-semibold font-nunito">
                {Intl.NumberFormat("en-IN").format(
                  formatPrice(totalPricePrintCustomize),
                )}{" "}
                {invoiceSetting?.currency_info?.code || " BDT"}
              </span>
            </p>
            {/* <p className="flex justify-between ">
              <span className="font-semibold font-nunito">Tax:</span>
              <span className="font-semibold font-nunito">
                {formatPrice(invoice.tax || 0)}{" "}
                {invoiceSetting?.currency_info?.code || " BDT"}
              </span>
            </p> */}
            {invoice?.delivery_info_id && (
              <p className="flex justify-between">
                <span className="font-semibold font-nunito">Delivery Fee:</span>
                <span className="font-semibold font-nunito">
                  {Intl.NumberFormat("en-IN").format(
                    formatPrice(invoice?.delivery_fee) || 0,
                  )}{" "}
                  {invoiceSetting?.currency_info?.code || " BDT"}
                </span>
              </p>
            )}
            <p className="flex justify-between">
              <span className="font-semibold font-nunito">Discount:</span>
              <span className="font-semibold font-nunito">
                {Intl.NumberFormat("en-IN").format(
                  formatPrice(invoice.discount) || 0,
                )}{" "}
                {invoiceSetting?.currency_info?.code || " BDT"}
              </span>
            </p>
            {invoice?.delivery_fee > 0 && (
              <p className="flex justify-between">
                <span className="font-semibold font-nunito">Delivery Fee:</span>
                <span className="font-semibold font-nunito">
                  {Intl.NumberFormat("en-IN").format(
                    formatPrice(invoice.delivery_fee) || 0,
                  )}{" "}
                  {invoiceSetting?.currency_info?.code || " BDT"}
                </span>
              </p>
            )}
            <div
              style={{
                borderTop: "0.5px solid #D3D3D3",
                margin: "10px 0",
              }}
            ></div>
            <p className="flex justify-between">
              <span className="font-semibold font-nunito">Grand Total:</span>
              <span className="font-semibold font-nunito">
                {Intl.NumberFormat("en-IN").format(
                  formatPrice(grandTotal || 0),
                )}{" "}
                {invoiceSetting?.currency_info?.code || " BDT"}
              </span>
            </p>
            {invoice?.multiple_payment?.length > 0 &&
              invoice.multiple_payment.map((payment, index) => (
                <p key={index} className="flex justify-between">
                  <span className="pl-5">
                    {payment.payment_type?.type_name ||
                      payment.payment_type_category?.[0]
                        ?.payment_category_name ||
                      "Unknown"}{" "}
                    Payment
                  </span>
                  <span>
                    {Intl.NumberFormat("en-IN").format(payment.payment_amount)}{" "}
                    {invoiceSetting?.currency_info?.code || "BDT"}
                  </span>
                </p>
              ))}
            <p className="flex justify-between">
              <span className="font-semibold font-nunito">Paid Amount:</span>
              <span className="font-semibold font-nunito">
                {/* {formatPrice(paidAmount || 0)}{" "} */}
                {(() => {
                  const totalExchangePrice =
                    exChangeImeis?.reduce(
                      (acc, item) => acc + (item.purchase_price || 0),
                      0,
                    ) || 0;

                  const adjustedPaidAmount =
                    invoice.paid_amount && invoice.paid_amount !== ""
                      ? invoice.paid_amount
                      : 0;

                  return (
                    Intl.NumberFormat("en-IN").format(
                      formatPrice(adjustedPaidAmount),
                    ) +
                    " " +
                    (invoiceSetting?.currency_info?.code || " BDT")
                  );
                })()}
              </span>
            </p>
            <div
              style={{
                borderTop: "0.5px solid #D3D3D3",
                margin: "10px 0",
              }}
            ></div>
            <p className="flex justify-between">
              <span className="font-semibold font-nunito">Due Amount:</span>
              <span className="font-semibold font-nunito">
                {Number.parseFloat(
                  Number(totalPricePrintCustomize) +
                  Number(invoice?.vat) +
                  Number(invoice?.tax) +
                  Number(invoice?.delivery_fee) -
                  Number(invoice?.discount) -
                  Number(
                    invoice.paid_amount && invoice.paid_amount !== ""
                      ? invoice.paid_amount
                      : 0,
                  ),
                ).toFixed(2) < 0
                  ? 0
                  : Intl.NumberFormat("en-IN").format(
                    Number.parseFloat(
                      Number(totalPricePrintCustomize) +
                      Number(invoice?.vat) +
                      Number(invoice?.tax) +
                      Number(invoice?.delivery_fee) -
                      Number(invoice?.discount) -
                      Number(
                        invoice.paid_amount && invoice.paid_amount !== ""
                          ? invoice.paid_amount
                          : 0,
                      ),
                    ).toFixed(2),
                  )}{" "}
                {invoiceSetting?.currency_info?.code
                  ? invoiceSetting?.currency_info?.code
                  : " BDT"}
              </span>
            </p>
            <div
              className="mt-1  text-white px-4 py-2 inline-block"
              style={{
                backgroundColor: invoiceSetting?.first_code || "orange",
              }}
            >
              <span className="font-bold">
                TOTAL:{" "}
                {Intl.NumberFormat("en-IN").format(
                  formatPrice(
                    Number(totalPricePrintCustomize) +
                    Number(invoice?.vat || 0) +
                    Number(invoice?.tax || 0) +
                    Number(invoice?.delivery_fee || 0) -
                    Number(invoice?.discount || 0),
                  ),
                )}{" "}
                {invoiceSetting?.currency_info?.code || " BDT"}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}

        {/* Terms and Signature */}
        {/* <div className="flex justify-between space-x-5 text-[10px] lg:text-sm mt-1">
          <div className="w-1/2">
            <h3 className="text-[10px] font-semibold text-gray-800 mb-2">
              Terms and Conditions
            </h3>
            <ul className="list-disc list-inside text-gray-700 text-[10px]">
              {inputs?.map((item, index) => (
                <li key={item.id || index}>{item.description}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="border-t border-gray-400 mt-16">
              <p className="font-bold">Customer Signature</p>
            </div>

            <div className="border-t border-gray-400 mt-20">
              <p className="font-bold">Authorized Signature</p>
            </div>
            <div className="flex justify-start mt-2">
              <QRCode
                className="w-[50px] object-contain"
                value={
                  invoice?.user_info?.web_address ||
                  invoice?.user_info?.invoice_settings?.web_address ||
                  "No Web Address set to the QR code"
                }
                size={50}
              />
            </div>
          </div>
        </div> */}

        <div className="w-full">
          <h3 className="text-[10px] font-semibold text-gray-800 mb-2">
            Terms and Conditions
          </h3>
          <ul className="list-disc list-inside text-gray-700 text-[10px]">
            {inputs?.map((item, index) => (
              <li key={item.id || index}>{item.description}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between space-x-5 text-[10px] lg:text-sm mt-16">
          <div className="border-t border-gray-400 ">
            <p className="font-bold">Customer Signature</p>
          </div>
          <QRCode
            className="w-[50px] object-contain"
            value={
              invoice?.user_info?.web_address ||
              invoice?.user_info?.invoice_settings?.web_address ||
              "No Web Address set to the QR code"
            }
            size={50}
          />
          <div className="border-t border-gray-400 ">
            <p className="font-bold">Authorized Signature</p>
          </div>
        </div>
        {/* <div className="flex justify-between space-x-5 text-[10px] lg:text-sm mt-1">
          <div className="flex flex-col justify-start items-start">
            <div className="flex justify-start mt-2">
              <QRCode
                className="w-[50px] object-contain"
                value={
                  invoice?.user_info?.web_address ||
                  invoice?.user_info?.invoice_settings?.web_address ||
                  "No Web Address set to the QR code"
                }
                size={50}
              />
            </div>
          </div>
        </div> */}

        {/* Bottom Stripe */}
        <div className="bottom-0 left-0 right-0 p-4">
          <div className="relative h-16 mt-8">
            <div className="absolute bottom-0 left-0 w-full h-full bg-white"></div>
            <div
              className="absolute bottom-0 left-0 w-full h-4 "
              style={{
                backgroundColor: invoiceSetting?.first_code || "orange",
              }}
            ></div>
            <div
              className="absolute bottom-0 right-0 w-1/4 h-12  clip-custom"
              style={{
                backgroundColor: invoiceSetting?.second_code || "black",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlInvoiceCustom;
