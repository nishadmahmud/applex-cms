"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Modal from "@/app/utils/Modal";
import { useGetWholeSellerListQuery } from "@/app/store/api/wholeSellerApi";
import { useSession } from "next-auth/react";
import AllWholeSellerPagination from "./all-wholeseller-pagination";
import AllWholeSellerTable from "./all-wholeseller-table";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

// 🧩 load dynamically (same popup used in billing)
const AddWholeSeller = dynamic(
  () => import("@/app/(dashboard)/wholesale/billing/components/AddWholeSeller"),
  { ssr: false }
);

export default function AllWholeSellerPage() {
  const { data: session, status } = useSession();
  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // 🔸 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(keyword), 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessWholesalerList =
    !isEmployee || canAccess(features, "Wholesale", "Wholesaler List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessWholesalerList;

  const token = session?.accessToken;
  const skip = status !== "authenticated" || !token || !shouldFetch;

  const { data, isLoading, error, refetch } = useGetWholeSellerListQuery(
    {
      page: currentPage,
      per_page: perPage,
      keyword: debounced || "",
    },
    { skip }
  );

  const wholesellers = data?.data?.data ?? [];
  const pagination = {
    current_page: data?.data?.current_page || 1,
    last_page: data?.data?.last_page || 1,
    total: data?.data?.total || 0,
    from: data?.data?.from || 0,
    to: data?.data?.to || 0,
    per_page: data?.data?.per_page || perPage,
  };

  return (
    <ProtectedRoute featureName="Wholesale" optionName="Wholesaler List">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Wholeseller List</h1>
          {status === "authenticated" && (
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Wholeseller
            </Button>
          )}
        </div>

        <Card className="p-6">
          {/* 🔍 Search bar */}
          <div className="flex gap-3 items-center mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search wholeseller..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
                disabled={status !== "authenticated"}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setKeyword("")}
              disabled={status !== "authenticated"}
              className="hover:bg-muted"
            >
              Clear
            </Button>
          </div>

          {status !== "authenticated" ? (
            <div className="text-center text-muted-foreground py-20">
              Please sign in to view wholesellers.
            </div>
          ) : isLoading ? (
            <div className="space-y-4 mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-md">
              Error loading wholesalers!
            </div>
          ) : (
            <>
              <AllWholeSellerTable data={wholesellers} />
              <AllWholeSellerPagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                perPage={perPage}
                onPageChange={(page) => setCurrentPage(page)}
                onPerPageChange={(val) => setPerPage(val)}
              />
            </>
          )}
        </Card>

        {/* ➕ Add Wholeseller Modal */}
        <Modal
          title="Add New Wholeseller"
          open={addModalOpen}
          onClose={setAddModalOpen}
          content={
            <AddWholeSeller
              setModalOpen={setAddModalOpen}
              setSchema={() => refetch()} // refresh list after add
            />
          }
        />
      </div>
    </ProtectedRoute>
  );
}
