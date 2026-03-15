"use client";
import { React } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AllSellInvoiceTable({ invoices }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = (inv) => {
    const sub = Number(inv?.sub_total || 0);
    const vat = Number(inv?.vat || 0);
    const tax = Number(inv?.tax || 0);
    const del = Number(inv?.delivery_fee || 0);
    const disc = Number(inv?.discount || 0);
    // ✅ final total before payment
    return sub + vat + tax + del - disc;
  };

  // ✅ Handle due / change logic based on API data
  const calculatePayment = (inv) => {
    const total = calculateTotal(inv);
    const paid = Number(inv?.paid_amount || 0);
    const change = Number(inv?.cash_change || 0);

    // Default: assume due
    let due = Math.max(total - paid, 0);
    let changeAmount = 0;

    if (change > 0) {
      // API says customer overpaid → show change
      due = 0;
      changeAmount = change;
    }

    return { total, due, changeAmount };
  };
  if (!invoices || invoices.length === 0) {
    return (
      <div className="mt-6 text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No invoices found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold w-[210px]">Date/Time</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold text-right w-[120px]">
              Total Amount
            </TableHead>
            <TableHead className="font-semibold text-right w-[140px] pr-4">
              Due
            </TableHead>
            <TableHead className="font-semibold w-[170px] pl-6">
              Payment Status
            </TableHead>
            <TableHead className="font-semibold text-right w-[150px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const { total, due, changeAmount } = calculatePayment(invoice);
            const createdDate = new Date(invoice.created_at);
            const timeAgo = formatDistanceToNow(createdDate, {
              addSuffix: true,
            });

            const phone =
              invoice.customer_phone || invoice.delivery_customer_phone || "-";
            const orderType = invoice.order_type || "shop";
            const salesPerson =
              invoice.user_info?.owner_name || invoice.user_info?.user_name || "N/A";
            const sellLocation = invoice.transaction_types || "Warehouse";
            const note = invoice.remarks;

            const paymentStatus =
              due > 0
                ? "Due"
                : changeAmount > 0
                  ? "Change"
                  : "Paid";

            const paymentClasses =
              paymentStatus === "Paid"
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                : paymentStatus === "Due"
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";

            const returnedAmount = Number(invoice.product_return_amount || 0);

            return (
              <TableRow key={invoice.id} className="hover:bg-muted/30 align-top">
                {/* Date / time + meta (sales person, location, note) */}
                <TableCell className="align-top w-[210px]">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {format(createdDate, "dd MMM, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    <p className="text-xs text-muted-foreground">
                      Sales person: {salesPerson}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sell location: {sellLocation}
                    </p>
                    {note && (
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        Note: {note}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Name + customer + phone + order type */}
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      {invoice.invoice_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customer_name || "Cash Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Phone: {phone}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Order type: {orderType}
                    </p>
                    {/* 🟢 Show parcel ID if steadfast_courier exists */}
                    {invoice.steadfast_courier &&
                    invoice.steadfast_courier.consignment_id ? (
                      <p className="text-xs text-blue-600">
                        Parcel ID: {invoice.steadfast_courier.consignment_id}
                      </p>
                    ) : null}
                  </div>
                </TableCell>

                {/* Total amount */}
                <TableCell className="text-right font-medium align-top pr-4">
                  {formatCurrency(total)}
                </TableCell>

                {/* Due + returned amount */}
                <TableCell className="text-right font-medium align-top">
                  {changeAmount > 0 ? (
                    <div className="inline-flex flex-col items-end gap-1">
                      <div className="inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v8m0 0l3.5-3.5M12 16l-3.5-3.5m3.5 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 1.657.507 3.19 1.375 4.462A8.003 8.003 0 0012 20.5z"
                          />
                        </svg>
                        <span className="text-sm font-semibold tracking-tight">
                          Change&nbsp;{formatCurrency(changeAmount)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        Returned: {formatCurrency(returnedAmount)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`${
                          due > 0
                            ? "text-red-600 font-semibold"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {due > 0 ? formatCurrency(due) : "0"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Returned: {formatCurrency(returnedAmount)}
                      </span>
                    </div>
                  )}
                </TableCell>

                {/* Payment Status + invoice status */}
                <TableCell className="align-top w-[170px] pl-6">
                  <div className="space-y-1">
                    <Badge
                      variant="outline"
                      className={paymentClasses}
                    >
                      {paymentStatus}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground">
                      Invoice:{" "}
                      {invoice.status == 1
                        ? "Completed"
                        : invoice.status == 2
                          ? "Pending"
                          : "Hold"}
                    </p>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/invoice/${invoice.invoice_id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950 bg-transparent"
                      >
                        VIEW
                      </Button>
                    </Link>
                    <Link href={`/invoice/edit/${invoice.invoice_id}`}>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        EDIT
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
