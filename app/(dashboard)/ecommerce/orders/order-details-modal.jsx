"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OrderDetailsModal({ open, onClose, order }) {
  if (!order) return null;
  const created = new Date(order.created_at).toLocaleString();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b bg-gray-50">
          <DialogTitle>Invoice Details — {order.invoice_id}</DialogTitle>
        </DialogHeader>

        {/* Scrollable container */}
        <div className="overflow-y-auto max-h-[80vh] p-6 text-sm space-y-6">
          {/* ========== GENERAL INFO ========== */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">General Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p>
                <b>Date:</b> {created}
              </p>
              <p>
                <b>Status:</b> {order.tran_status}
              </p>
              <p>
                <b>Payment Mode:</b> {order.pay_mode}
              </p>
              <p>
                <b>Amount Paid:</b> {order.paid_amount}
              </p>
              <p>
                <b>Delivery Fee:</b> {order.delivery_fee}
              </p>
              <p>
                <b>Transaction:</b> {order.transaction_status}
              </p>
            </div>
          </section>

          {/* ========== CUSTOMER DETAILS ========== */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p>
                <b>Name:</b> {order.delivery_customer_name}
              </p>
              <p>
                <b>Phone:</b> {order.delivery_customer_phone}
              </p>
              <p className="sm:col-span-2">
                <b>Address:</b> {order.delivery_customer_address}
              </p>
            </div>
          </section>

          {/* ========== PRODUCT DETAILS ========== */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Products</h3>
            <div className="border rounded-md divide-y">
              {order.sales_details?.map((item) => {
                const p = item.product_info || {};
                const pi = item.product_item; // may exist or be null
                return (
                  <div
                    key={item.id}
                    className="p-3 flex flex-col sm:flex-row gap-4"
                  >
                    {/* product image */}
                    <div className="w-24 h-24 flex-shrink-0 border rounded bg-gray-50 overflow-hidden">
                      {pi?.images?.[0] ? (
                        <img
                          src={pi.images[0]}
                          alt={p.name}
                          className="object-cover w-full h-full"
                        />
                      ) : p.image_paths?.[0] ? (
                        <img
                          src={p.image_paths[0]}
                          alt={p.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* product text */}
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{p.name}</p>
                      <div className="text-xs text-gray-600">
                        <p>SKU: {pi?.sku || p.sku}</p>
                        {pi?.barcode && <p>Barcode: {pi.barcode}</p>}
                        {p.category?.name && <p>Category: {p.category.name}</p>}
                        {p.brands && <p>Brand: {p.brands.name}</p>}
                        {p.color_code && (
                          <p>
                            Color Code:
                            <span
                              className="inline-block w-3 h-3 rounded-full ml-1 border"
                              style={{ backgroundColor: p.color_code }}
                            />
                          </p>
                        )}
                      </div>

                      <p>
                        Qty × Price:&nbsp;
                        <b>{item.qty}</b>&nbsp;×&nbsp;
                        <b>{item.price}</b>
                      </p>

                      {pi && (
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p>
                            <b>Variant Item ID:</b> {pi.id}
                          </p>
                          <p>
                            <b>Sell Price:</b> {pi.sell_price} |
                            <b>Purchase Price:</b> {pi.purchase_price}
                          </p>
                          <p>
                            <b>Stock Qty:</b> {pi.quantity} | <b>Status:</b>
                            {pi.status}
                          </p>
                          {pi.discount !== "0.00" && (
                            <p>Discount: {pi.discount}</p>
                          )}
                          {pi.description && <p>{pi.description}</p>}
                        </div>
                      )}
                      {!pi && (
                        <div className="text-xs text-gray-500">
                          <p>
                            <b>Purchase Price:</b> {item.purchase_price}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ========== PAYMENT INFO ========== */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Payment Information
            </h3>
            <div className="border rounded-md divide-y">
              {order.multiple_payment?.map((m) => (
                <div
                  key={m.id}
                  className="p-2 flex flex-col sm:flex-row justify-between text-sm"
                >
                  <span>{m.payment_type?.type_name}</span>
                  <span className="font-medium">${m.payment_amount}</span>
                  <span className="text-xs text-gray-500">
                    {
                      m.payment_type?.payment_type_category?.[0]
                        ?.payment_category_name
                    }
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ========== OUTLET INFO ========== */}
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Outlet Info</h3>
            <div>
              <p>{order.user_info?.outlet_name}</p>
              <p className="text-xs text-gray-600">
                {order.user_info?.email}&nbsp;|&nbsp;{order.user_info?.phone}
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
