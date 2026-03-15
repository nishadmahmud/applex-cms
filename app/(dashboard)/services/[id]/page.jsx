"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetServiceDetailsQuery } from "@/app/store/api/servicesApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, ArrowLeft, Paperclip, Printer } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
    Completed: "bg-green-100 text-green-700 border-green-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
};

const Field = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-medium text-gray-900">{value || "—"}</p>
    </div>
);

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const sid = params?.id;

    const { data: res, isLoading } = useGetServiceDetailsQuery(sid, { skip: !sid });
    const d = res?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!d) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center text-gray-500">
                    Service record not found.
                    <br />
                    <Button variant="link" onClick={() => router.back()}>Go back</Button>
                </div>
            </div>
        );
    }

    const invoiceNo = d.service_invoice_id || d.invoice_id || d.service_id;

    return (
        <ProtectedRoute featureName="Service Management" optionName="Service List">
            <div className="min-h-screen bg-slate-100 py-6">
                <div className="max-w-5xl mx-auto px-4">
                    {/* Top controls */}
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <div className="flex items-center gap-2">
                            {(d.invoice_id || d.service_id || d.service_invoice_id) && (
                                <Link href={`/invoice/${d.invoice_id || d.service_id || d.service_invoice_id}`}>
                                    <Button variant="outline" size="sm">
                                        <Printer className="w-4 h-4 mr-1" /> View Invoice
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/services/edit/${sid}`}>
                                <Button size="sm">
                                    <Pencil className="w-4 h-4 mr-1" /> Edit Service
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Invoice-style card */}
                    <div className="bg-white shadow-md rounded-md overflow-hidden border border-slate-200">
                        {/* Header band */}
                        <div className="bg-slate-900 h-16 w-full" />

                        <div className="px-8 pt-6 pb-10">
                            {/* Title + meta */}
                            <div className="flex items-start justify-between border-b pb-4 mb-4">
                                <div>
                                    <p className="text-xs tracking-[0.25em] text-gray-500 mb-1">
                                        SERVICE INVOICE
                                    </p>
                                    <h1 className="text-2xl font-semibold text-gray-900">
                                        {invoiceNo || "SERVICE"}
                                    </h1>
                                    {d.created_at && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Date:{" "}
                                            {new Date(d.created_at).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600"}`}>
                                        {d.status || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            {/* Customer + service info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                        Customer
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {d.customer?.name || d.customer_name || "—"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Contact: {d.customer?.phone || d.customer_phone || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                        Service Type
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {d.service_type?.name || d.service_type_name || "—"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-2">
                                        <span className="font-semibold">Issue:</span>{" "}
                                        {d.issue_description || "—"}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-semibold">Checking:</span>{" "}
                                        {d.checking_description || "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Products table */}
                            {d.service_products?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">
                                        SERVICED ITEMS
                                    </p>
                                    <div className="border border-slate-200 rounded-md overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">
                                                        #
                                                    </th>
                                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">
                                                        Description
                                                    </th>
                                                    <th className="py-2 px-3 text-center font-semibold text-gray-700">
                                                        Units
                                                    </th>
                                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">
                                                        Technicians
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {d.service_products.map((p, i) => (
                                                    <tr
                                                        key={i}
                                                        className="border-b border-slate-100 last:border-0"
                                                    >
                                                        <td className="py-2 px-3 text-center">
                                                            {i + 1}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {p.product_info?.name ||
                                                                p.product_name ||
                                                                `Product #${p.product_id}`}
                                                        </td>
                                                        <td className="py-2 px-3 text-center">
                                                            {p.servicing_unit}
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            {(p.technicians || [])
                                                                .map((t) => t.name)
                                                                .join(", ") || "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Financial summary similar to invoice */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* Empty left column for symmetry / notes */}
                                <div className="text-xs text-gray-600">
                                    {d.attachment && (
                                        <div className="mb-4">
                                            <a
                                                href={d.attachment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <Paperclip className="w-4 h-4" /> View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Summary box */}
                                <div className="border border-slate-200 rounded-md text-xs">
                                    <div className="px-4 py-2 border-b bg-slate-50">
                                        <p className="font-semibold text-gray-800">
                                            Financial Summary
                                        </p>
                                    </div>
                                    <div className="px-4 py-3 space-y-1.5">
                                        <div className="flex justify-between">
                                            <span>Service Fees</span>
                                            <span>{fmt(d.fees)}</span>
                                        </div>
                                        {d.vat > 0 && (
                                            <div className="flex justify-between">
                                                <span>VAT</span>
                                                <span>{fmt(d.vat)}</span>
                                            </div>
                                        )}
                                        {d.tax > 0 && (
                                            <div className="flex justify-between">
                                                <span>Service Charge</span>
                                                <span>{fmt(d.tax)}</span>
                                            </div>
                                        )}
                                        {d.discount > 0 && (
                                            <div className="flex justify-between text-red-600">
                                                <span>Discount</span>
                                                <span>(-) {fmt(d.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold border-t pt-1 mt-1 text-sm">
                                            <span>Grand Total</span>
                                            <span>{fmt(d.total)}</span>
                                        </div>
                                        <div className="flex justify-between text-green-700">
                                            <span>Paid Amount</span>
                                            <span>{fmt(d.paid_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-red-600 font-semibold">
                                            <span>Due Amount</span>
                                            <span>{fmt(d.due_amount)}</span>
                                        </div>
                                        {d.return_amount > 0 && (
                                            <div className="flex justify-between text-blue-600">
                                                <span>Return Amount</span>
                                                <span>{fmt(d.return_amount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
