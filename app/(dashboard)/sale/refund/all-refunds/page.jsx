"use client";

import { React, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RefundFilters from "./refund-filter";
import RefundPagination from "./refund-pagination";
import RefundTable from "./refund-table";
import { useGetRefundsQuery } from "@/app/store/api/refundApi";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AllRefundsPage() {
    const { data: session, status } = useSession();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("refundPerPage");
            if (saved === "all") return 10000;
            return Number.parseInt(saved || "10", 10);
        }
        return 10;
    });

    // Filter state
    const [filters, setFilters] = useState({
        keyword: "",
        status: "", // pending, approved, rejected, etc.
    });

    // Debounced search
    const [debouncedKeyword, setDebouncedKeyword] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(filters.keyword);
        }, 300);
        return () => clearTimeout(handler);
    }, [filters.keyword]);

    // Fetch refund requests
    const validLimit = !isNaN(perPage) && perPage > 0 ? perPage : 10000;

    const { data, isLoading, error } = useGetRefundsQuery(
        {
            page: currentPage,
            limit: validLimit,
            payload: { ...filters, keyword: debouncedKeyword },
            token: session?.accessToken,
        },
        {
            skip: status !== "authenticated" || !session?.accessToken,
        }
    );

    // Save perPage to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const valueToSave = perPage === 10000 ? "all" : perPage.toString();
            localStorage.setItem("refundPerPage", valueToSave);
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

    const rawRefunds = Array.isArray(data?.data) ? data.data : (data?.data?.data || []);

    // Client-side pagination since API returns flat array
    const totalItems = rawRefunds.length;
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalItems);

    // Fallback if perPage is 'all'
    const paginatedRefunds = perPage === 10000
        ? rawRefunds
        : rawRefunds.slice(startIndex, endIndex);

    const paginationData = {
        current_page: currentPage,
        last_page: Math.max(1, Math.ceil(totalItems / perPage)),
        per_page: perPage,
        total: totalItems,
        from: totalItems === 0 ? 0 : startIndex + 1,
        to: endIndex,
    };

    return (
        <ProtectedRoute featureName="Ecommerce" optionName="Refund Requests">
            <div className="container mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">
                        Refund Requests
                    </h1>
                </div>

                <Card className="p-6">
                    <RefundFilters
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
                            <p className="font-medium">Error loading refunds</p>
                            <p className="text-sm">
                                {error?.data?.message || "Something went wrong"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <RefundTable refunds={paginatedRefunds} />

                            <RefundPagination
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
