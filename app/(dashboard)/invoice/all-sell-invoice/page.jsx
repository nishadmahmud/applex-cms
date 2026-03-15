"use client";

import { React, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AllSellInvoiceFilters from "./all-sell-invoice-filter";
import AllSellInvoicePagination from "./all-sell-invoice-pagination";
import AllSellInvoiceTable from "./all-sell-invoice-table";
import { useSearchInvoiceMutation } from "@/app/store/api/allSellInvoiceApi";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function AllSellInvoicePage() {
  const { data: session, status } = useSession();
  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessSaleInvoice =
    !isEmployee || canAccess(features, "Sale", "Sale Invoice");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessSaleInvoice;

  const [searchInvoice, { data, isLoading, error }] =
    useSearchInvoiceMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("invoicePerPage");
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
    dueOnly: false,
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

    searchInvoice({
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
    searchInvoice,
    status,
    session,
  ]);

  // Save perPage to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const valueToSave = perPage === 10000 ? "all" : perPage.toString();
      localStorage.setItem("invoicePerPage", valueToSave);
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
    <ProtectedRoute featureName="Sale" optionName="Sale Invoice">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            All Selling Invoice
          </h1>
        </div>

        <Card className="p-6">
          <AllSellInvoiceFilters
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
              <p className="font-medium">Error loading invoices</p>
              <p className="text-sm">
                {error?.data?.message || "Something went wrong"}
              </p>
            </div>
          ) : (
            <>
              <AllSellInvoiceTable invoices={invoiceData} />

              <AllSellInvoicePagination
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
