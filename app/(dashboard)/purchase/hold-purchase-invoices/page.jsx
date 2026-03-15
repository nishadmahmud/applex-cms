"use client";

import React, { useState, useEffect } from "react";
import { useGetHeldPurchaseInvoicesQuery } from "@/app/store/api/allPurchaseInvoicesApi";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export default function HoldPurchaseInvoicesPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("holdInvoiceLimit") || 50);
    }
    return 50;
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetHeldPurchaseInvoicesQuery(
    { page: currentPage, limit },
    { skip: status !== "authenticated" },
  );

  useEffect(() => {
    if (status === "authenticated") refetch();
  }, [limit, currentPage, refetch, status]);

  const invoicesData = response?.data;

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-US").format(amount || 0);

  const handleLimitChange = (val) => {
    const newLimit = parseInt(val);
    setLimit(newLimit);
    localStorage.setItem("holdInvoiceLimit", newLimit.toString());
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (!invoicesData) return null;
    const { current_page, last_page } = invoicesData;

    const pages = [];
    pages.push(1);

    const startPage = Math.max(2, current_page - 1);
    const endPage = Math.min(last_page - 1, current_page + 1);

    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < last_page - 1) pages.push("...");
    if (last_page > 1) pages.push(last_page);

    return (
      <div className="flex justify-end items-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={current_page === 1}
          className="px-4"
        >
          Prev
        </Button>
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={current_page === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(last_page, prev + 1))
          }
          disabled={current_page === last_page}
          className="px-4"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-blue-900">
          Held Purchase Invoices
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Per Page:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Header Row */}
        <div className="grid grid-cols-[2fr,2fr,1fr,1fr,1fr,1.5fr] gap-4 p-4 border-b font-semibold">
          <div>Invoice ID</div>
          <div>Vendor</div>
          <div>Total</div>
          <div>Paid</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load held invoices.
          </div>
        ) : invoicesData?.data?.length > 0 ? (
          invoicesData.data.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-[2fr,2fr,1fr,1fr,1fr,1.5fr] gap-4 p-4 border-b hover:bg-gray-50 text-[15px]"
            >
              {/* Invoice */}
              <div className="font-medium text-blue-900">
                {invoice.invoice_id}
              </div>

              {/* Vendor */}
              <div>
                <div className="text-gray-800 font-medium">
                  {invoice.vendor_name}
                </div>
              </div>

              {/* Total */}
              <div>{formatAmount(invoice.sub_total)}</div>

              {/* Paid */}
              <div>{formatAmount(invoice.paid_amount)}</div>

              {/* Status */}
              <div className="text-red-600 font-semibold">Hold</div>

              {/* Action */}
              <div className="flex gap-2">
                <Link href={`/invoice/${invoice.invoice_id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 bg-transparent"
                  >
                    VIEW
                  </Button>
                </Link>
                <Link href={`/invoice/edit/${invoice.invoice_id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    EDIT
                  </Button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No held invoices found
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
