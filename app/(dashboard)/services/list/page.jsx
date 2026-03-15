"use client";
import React, { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { toast } from "sonner";
import { useSearchServiceQuery, useDeleteServiceMutation } from "@/app/store/api/servicesApi";

const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
    Completed: "bg-green-100 text-green-700 border-green-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
};

export default function ServiceListPage() {
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [customerSearch, setCustomerSearch] = useState(true);
    const [serviceSearch, setServiceSearch] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    const { data: res, isLoading, isFetching, refetch, error } = useSearchServiceQuery({
        keyword,
        customerSearch,
        serviceSearch,
        page,
        limit,
    });


    const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

    const services = res?.data?.data || res?.data || [];
    const lastPage = res?.data?.last_page || 1;
    const currentPage = res?.data?.current_page || page;
    const total = res?.data?.total || services.length;
    
    // Treat res.success === false as an API error even if status is 200
    const apiError = error || (res?.success === false ? { data: { message: res.message } } : null);

    const handleSearch = () => {
        setKeyword(searchInput);
        setPage(1);
    };

    const handleDelete = async (serviceInvoiceId) => {
        if (!confirm(`Delete service ${serviceInvoiceId}? This cannot be undone.`)) return;
        try {
            await deleteService(serviceInvoiceId).unwrap();
            toast.success("Service deleted successfully.");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete service.");
        }
    };

    const formatAmount = (n) =>
        Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    /* Pagination */
    const renderPagination = () => {
        if (lastPage <= 1) return null;
        const pages = [];
        pages.push(1);
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(lastPage - 1, currentPage + 1);
        if (start > 2) pages.push("...");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < lastPage - 1) pages.push("...");
        if (lastPage > 1) pages.push(lastPage);

        return (
            <div className="flex items-center gap-2 mt-6 justify-center flex-wrap">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={currentPage === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(p)}
                            className="min-w-[36px]"
                        >
                            {p}
                        </Button>
                    )
                )}
                <Button variant="outline" size="sm" disabled={currentPage === lastPage} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
        );
    };

    return (
        <ProtectedRoute featureName="Service Management" optionName="Service List">
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="text-2xl font-bold">Service List</CardTitle>
                            <Link href="/services/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Service
                                </Button>
                            </Link>
                        </div>

                        {/* Search bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mt-4">
                            <div className="flex-1 flex gap-2">
                                <Input
                                    placeholder="Search by customer name, service ID…"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="max-w-sm"
                                />
                                <Button onClick={handleSearch} variant="outline">
                                    <Search className="w-4 h-4 mr-1" /> Search
                                </Button>
                            </div>

                            {/* Search scope toggle */}
                            <div className="flex gap-4 text-sm text-gray-600 items-center">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.checked)}
                                        className="accent-blue-600"
                                    />
                                    Customer
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.checked)}
                                        className="accent-blue-600"
                                    />
                                    Service ID
                                </label>
                            </div>

                            {/* Per page */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 whitespace-nowrap">Per page:</span>
                                <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                                    <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50, 100].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {total > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {services.length} of {total} services
                            </p>
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Service Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Paid</TableHead>
                                        <TableHead className="text-right">Due</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading || isFetching ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-10 text-gray-400">
                                                Loading services…
                                            </TableCell>
                                        </TableRow>
                                    ) : apiError ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-12 text-center">
                                                <div className="inline-flex flex-col items-center gap-3">
                                                    <div className="rounded-full bg-red-100 p-3">
                                                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                                    </div>
                                                    <p className="font-semibold text-gray-700">Service List Error</p>
                                                    <p className="text-sm text-gray-500 max-w-md">
                                                        {apiError?.data?.message || apiError?.error || "An unexpected error occurred while fetching services."}
                                                    </p>
                                                    {apiError?.status && (
                                                        <Badge variant="outline" className="mt-2 text-red-500 border-red-200">
                                                            Status: {apiError.status}
                                                        </Badge>
                                                    )}
                                                    <Button variant="link" size="sm" onClick={() => refetch()} className="mt-2">
                                                        Try Again
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : services.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-10 text-gray-400 italic">
                                                No services found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        services.map((svc) => (
                                            <TableRow key={svc.id || svc.service_invoice_id}>
                                                <TableCell className="font-medium text-blue-700">
                                                    {svc.service_invoice_id || svc.invoice_id || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{svc.customer?.name || svc.customer_name || "—"}</div>
                                                    <div className="text-xs text-gray-500">{svc.customer?.phone || svc.customer_phone || ""}</div>
                                                </TableCell>
                                                <TableCell>{svc.service_type?.name || svc.service_type_name || "—"}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[svc.status] || "bg-gray-100 text-gray-600 border-gray-300"}`}>
                                                        {svc.status || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{formatAmount(svc.total)}</TableCell>
                                                <TableCell className="text-right">{formatAmount(svc.paid_amount)}</TableCell>
                                                <TableCell className="text-right text-red-600 font-medium">
                                                    {formatAmount(svc.due_amount)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{formatDate(svc.created_at)}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/invoice/${svc.service_invoice_id || svc.invoice_id}`}>
                                                            <Button size="icon" variant="ghost" title="View">
                                                                <Eye className="w-4 h-4 text-blue-600" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/services/edit/${svc.service_invoice_id || svc.invoice_id}`}>
                                                            <Button size="icon" variant="ghost" title="Edit">
                                                                <Pencil className="w-4 h-4 text-gray-600" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            title="Delete"
                                                            disabled={isDeleting}
                                                            onClick={() => handleDelete(svc.service_invoice_id || svc.invoice_id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {renderPagination()}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
