"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AllWholeSaleInvoiceFilters from "./all-wholesale-invoice-filter";
import AllWholeSaleInvoicePagination from "./all-wholesale-invoice-pagination";
import AllWholeSaleInvoiceTable from "./all-wholesale-invoice-table";
import {
  useGetWholeSaleInvoiceListQuery,
  useSearchWholeSaleInvoiceMutation,
} from "@/app/store/api/allWholeSaleInvoiceApi";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function AllWholeSaleInvoicePage() {
  const { data: session, status } = useSession();

  const [searchInvoice, { data: searchData, isLoading: searching, error }] =
    useSearchWholeSaleInvoiceMutation();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("invoicePerPage") || "6", 10);
    }
    return 6;
  });

  // Filters
  const [filters, setFilters] = useState({
    keyword: "",
    nameId: false,
    emailId: false,
    phoneId: false,
    startDate: 0,
    endDate: new Date().toISOString(),
  });

  // Debounce for search
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(filters.keyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.keyword]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessWholesaleList =
    !isEmployee || canAccess(features, "Wholesale", "Wholesale List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessWholesaleList;

  // ---  Authentication/Token check
  const token = session?.accessToken;
  const skip = status !== "authenticated" || !token || !shouldFetch;

  // ---  Load initial wholesale invoices
  const { data: initialData, isLoading: loadingInitial } =
    useGetWholeSaleInvoiceListQuery(
      { page: currentPage, limit: perPage, token },
      { skip }
    );

  // ---  Run search when filter, page, or keyword changes
  useEffect(() => {
    if (skip) return;
    const payload = { ...filters, keyword: debouncedKeyword };
    searchInvoice({
      page: currentPage,
      limit: perPage,
      payload,
      token,
    });
  }, [
    currentPage,
    perPage,
    debouncedKeyword,
    filters,
    searchInvoice,
    skip,
    token,
  ]);

  // ---  Persist perPage to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("invoicePerPage", perPage.toString());
    }
  }, [perPage]);

  // Filter + Pagination Handlers
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };
  const handlePageChange = (page) => setCurrentPage(page);
  const handlePerPageChange = (value) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  // ✅ ----------------------- FIXED PART -----------------------
  // The search API gives structure: searchData.data.data.data OR searchData.data.data
  // Safely derive invoices from whichever exists.
  const searchedInvoices =
    searchData?.data?.data?.data ?? searchData?.data?.data ?? [];

  // If search returns at least one invoice, use it; otherwise use initial list.
  const invoiceData =
    Array.isArray(searchedInvoices) && searchedInvoices.length > 0
      ? searchedInvoices
      : initialData?.data?.data || [];

  // Pagination consistency
  const paginationData = {
    current_page:
      searchData?.data?.data?.current_page ||
      initialData?.data?.current_page ||
      1,
    last_page:
      searchData?.data?.data?.last_page || initialData?.data?.last_page || 1,
    per_page:
      searchData?.data?.data?.per_page ||
      initialData?.data?.per_page ||
      perPage,
    total: searchData?.data?.data?.total || initialData?.data?.total || 0,
    from: searchData?.data?.data?.from || initialData?.data?.from || 0,
    to: searchData?.data?.data?.to || initialData?.data?.to || 0,
  };
  // ✅ -----------------------------------------------------------

  return (
    <ProtectedRoute featureName="Wholesale" optionName="Wholesale List">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            All Wholesale Invoices
          </h1>
        </div>

        <Card className="p-6">
          <AllWholeSaleInvoiceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {loadingInitial || searching ? (
            <div className="space-y-4 mt-6">
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
              <AllWholeSaleInvoiceTable invoices={invoiceData} />

              <AllWholeSaleInvoicePagination
                currentPage={paginationData.current_page}
                lastPage={paginationData.last_page}
                perPage={perPage}
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
