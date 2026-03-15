"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Plus, X, ArrowRight, Loader2 } from "lucide-react";

import { setToken } from "@/app/store/authSlice";
import {
  useDeleteSalesReturnMutation,
  useGetSalesReturnListQuery,
  useSearchSalesReturnQuery,
  useChangeSalesReturnStatusMutation,
} from "@/app/store/api/salesReturnApi";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import SaleReturnPagination from "./sale-return-pagination";
import CreateSaleReturnModal from "./CreateSaleReturnModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function SalesReturnListPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    isDestructive: false,
  });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessSaleReturn =
    !isEmployee || canAccess(features, "Sale", "Sale Return");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessSaleReturn;

  const { data: listData, isFetching: listLoading } =
    useGetSalesReturnListQuery(
      { page: currentPage, limit: perPage },
      { skip: status !== "authenticated" || isSearchActive || !shouldFetch }
    );

  const { data: searchData, isFetching: searchLoading } =
    useSearchSalesReturnQuery(
      { search: searchText, page: currentPage, limit: perPage },
      { skip: !isSearchActive || status !== "authenticated" }
    );

  const [deleteSalesReturn] = useDeleteSalesReturnMutation();
  const [changeSalesReturnStatus] = useChangeSalesReturnStatusMutation();

  const salesReturns = isSearchActive
    ? searchData?.data || []
    : listData?.data?.data || [];
  const pagination = isSearchActive ? null : listData?.data;
  const loading = listLoading || searchLoading;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")} ${date.toLocaleString(
      "en-US",
      { month: "short" }
    )}, ${date.getFullYear()}`;
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const handleSearch = () => {
    if (searchText.trim() === "") {
      toast.warning("Please enter a search keyword");
      setIsSearchActive(false);
      return;
    }
    setCurrentPage(1);
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setIsSearchActive(false);
  };

  // --- UPDATED to send '1' or '0' as a STRING in payload ---
  const handleToggleStatus = (returnId, currentStatus) => {
    // Calculate the new status as a string ("1" or "0")
    const newStatus = currentStatus === "1" ? "0" : "1";
    // Determine the user-friendly text based on the new string status
    const newStatusText = newStatus === "1" ? "RECEIVED" : "NOT RECEIVED";

    setDialogConfig({
      open: true,
      title: "Confirm Status Change",
      description: `Are you sure you want to mark this return as ${newStatusText}?`,
      isDestructive: false,
      onConfirm: async () => {
        setProcessingId(returnId);
        try {
          // Construct the payload with the string status
          const payload = {
            return_id: returnId,
            status: newStatus,
          };
          const res = await changeSalesReturnStatus(payload).unwrap();
          if (res.success) {
            toast.success("Status updated successfully!");
          } else {
            toast.error(res.message || "Failed to update status.");
          }
        } catch (err) {
          console.error("Status change failed:", err);
          toast.error("An error occurred while updating the status.");
        } finally {
          setProcessingId(null);
          setDialogConfig({ ...dialogConfig, open: false });
        }
      },
    });
  };

  const handleDelete = (id, returnId) => {
    setDialogConfig({
      open: true,
      title: "Are you absolutely sure?",
      description: `This action cannot be undone. This will permanently delete the sales return (${returnId}).`,
      isDestructive: true,
      onConfirm: async () => {
        setProcessingId(id);
        try {
          const res = await deleteSalesReturn(id).unwrap();
          if (res.success) {
            toast.success("Sales return deleted successfully!");
          } else {
            toast.error(res.message || "Failed to delete record.");
          }
        } catch (err) {
          console.error("Delete failed:", err);
          toast.error("Error deleting sales return.");
        } finally {
          setProcessingId(null);
          setDialogConfig({ ...dialogConfig, open: false });
        }
      },
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Please sign in.
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Sale" optionName="Sale Return">
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Sales Return List
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Invoice or Customer"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-20"
              />
              {isSearchActive ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> New Return
            </Button>
            <CreateSaleReturnModal open={open} onClose={() => setOpen(false)} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="grid grid-cols-[2.5fr,1.5fr,1.5fr,1.5fr,1.2fr,1.5fr] gap-4 p-4 bg-gray-100 font-semibold text-gray-700 text-sm">
            <div>Name</div>
            <div>Purchased Date</div>
            <div>Return Date</div>
            <div>Return Amount</div>
            <div>Receiving Status</div>
            <div className="text-center">Action</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading sales returns...
            </div>
          ) : salesReturns?.length > 0 ? (
            salesReturns.map((entry) => {
              const customerName =
                entry?.customers?.name ||
                entry?.sales?.customer_name ||
                "Unknown";
              const purchaseDate =
                entry?.sales?.created_at || entry?.created_at;

              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[2.5fr,1.5fr,1.5fr,1.5fr,1.2fr,1.5fr] gap-4 items-center p-4 border-b text-sm hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold text-blue-900">
                      {entry.return_id}
                    </div>
                    <div className="text-xs text-gray-500">{customerName}</div>
                  </div>
                  <div>{formatDate(purchaseDate)}</div>
                  <div>{formatDate(entry.invoice_date)}</div>
                  <div>{formatAmount(entry.return_amount)} BDT</div>
                  <div className="flex items-center">
                    <Switch
                      checked={entry.return_status === "1"}
                      onCheckedChange={() =>
                        handleToggleStatus(entry.return_id, entry.return_status)
                      }
                      disabled={processingId === entry.return_id}
                    />
                    {processingId === entry.return_id && (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-500" />
                    )}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Link href={`/sale/return/${entry.return_id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        VIEW
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(entry.id, entry.return_id)}
                      disabled={processingId === entry.id}
                    >
                      {processingId === entry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "DELETE"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              No sales return records found.
            </div>
          )}
        </div>

        {/* Pagination & Dialog */}
        {!isSearchActive && pagination && (
          <SaleReturnPagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            perPage={perPage}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={setCurrentPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setCurrentPage(1);
            }}
          />
        )}

        <AlertDialog
          open={dialogConfig.open}
          onOpenChange={(open) => setDialogConfig({ ...dialogConfig, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogConfig.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogConfig.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={dialogConfig.onConfirm}
                className={
                  dialogConfig.isDestructive
                    ? buttonVariants({ variant: "destructive" })
                    : ""
                }
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
