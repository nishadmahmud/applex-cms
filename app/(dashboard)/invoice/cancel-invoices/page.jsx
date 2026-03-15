"use client";

import { React, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CancelInvoiceFilters from "./cancel-invoice-filter";
import CancelInvoicePagination from "./cancel-invoice-pagination";
import CancelInvoiceTable from "./cancel-invoice-table";
import { useSearchCancelInvoiceMutation } from "@/apiHooks/hooks/useCancelInvoiceQuery";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function CancelInvoicePage() {
    const { data: session, status } = useSession();
    const isEmployee = !!session?.isEmployee;
    const { data: features, isLoading: permLoading } = useRolePermissions();

    const canAccessCancelInvoice =
        !isEmployee || canAccess(features, "Sale", "Cancel Invoice List");
    const permissionsReady = !permLoading && status === "authenticated";
    const shouldFetch = permissionsReady && canAccessCancelInvoice;

    const [searchCancelInvoice, { data, isLoading, error }] =
        useSearchCancelInvoiceMutation();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("cancelInvoicePerPage");
            if (saved === "all") return 10000;
            return Number.parseInt(saved || "6", 10);
        }
        return 6;
    });

    // Filter state
    const [filters, setFilters] = useState({
        keyword: "",
        nameId: false,
        emailId: false,
        phoneId: false,
        product: false,
        startDate: 0,
        endDate: new Date().toISOString(),
    });

    // Debounced search
    const [debouncedKeyword, setDebouncedKeyword] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(filters.keyword);
        }, 300);
        return () => clearTimeout(handler);
    }, [filters.keyword]);

    // Fetch invoices when filters or pagination changes
    useEffect(() => {
        if (!shouldFetch) return;
        if (status !== "authenticated" || !session?.accessToken) return;
        const token = session?.accessToken;
        const payload = {
            ...filters,
            keyword: debouncedKeyword,
        };

        // Ensure perPage is a valid number, fallback to 10000 if invalid
        const validLimit = !isNaN(perPage) && perPage > 0 ? perPage : 10000;

        searchCancelInvoice({
            page: currentPage,
            limit: validLimit,
            payload,
            token,
        });
    }, [
        shouldFetch,
        currentPage,
        perPage,
        debouncedKeyword,
        filters,
        searchCancelInvoice,
        status,
        session,
    ]);

    // Save perPage to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const valueToSave = perPage === 10000 ? "all" : perPage.toString();
            localStorage.setItem("cancelInvoicePerPage", valueToSave);
        }
    }, [perPage]);

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (value) => {
        if (value === "all") {
            setPerPage(10000);
        } else {
            setPerPage(Number.parseInt(value, 10));
        }
        setCurrentPage(1);
    };

    const invoiceData = data?.data?.data || [];
    const paginationData = {
        current_page: data?.data?.current_page || 1,
        last_page: data?.data?.last_page || 1,
        per_page: data?.data?.per_page || perPage,
        total: data?.data?.total || 0,
        from: data?.data?.from || 0,
        to: data?.data?.to || 0,
    };

    return (
        <ProtectedRoute featureName="Sale" optionName="Cancel Invoice List">
            <div className="container mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">
                        Cancel Invoice List
                    </h1>
                </div>

                <Card className="p-6">
                    <CancelInvoiceFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    {isLoading ? (
                        <div className="space-y-4 mt-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : error ? (
                        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg">
                            <p className="font-medium">Error loading cancelled invoices</p>
                            <p className="text-sm">
                                {error?.data?.message || "Something went wrong"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <CancelInvoiceTable invoices={invoiceData} />

                            <CancelInvoicePagination
                                currentPage={paginationData.current_page}
                                lastPage={paginationData.last_page}
                                perPage={perPage === 10000 ? "all" : perPage}
                                total={paginationData.total}
                                from={paginationData.from}
                                to={paginationData.to}
                                onPageChange={handlePageChange}
                                onPerPageChange={handlePerPageChange}
                            />
                        </>
                    )}
                </Card>
            </div>
        </ProtectedRoute>
    );
}
