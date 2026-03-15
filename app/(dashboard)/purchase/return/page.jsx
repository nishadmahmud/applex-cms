"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Plus, X, ArrowRight, Loader2 } from "lucide-react";

import { setToken } from "@/app/store/authSlice";
import {
  useDeletePurchaseReturnMutation,
  useGetPurchaseReturnListQuery,
  useSearchPurchaseReturnQuery,
  useChangePurchaseReturnStatusMutation,
} from "@/app/store/api/purchaseReturnApi";

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
import CreatePurchaseReturnModal from "./create-purchase-return-modal";
import PurchaseReturnPagination from "./purchase-return-pagination";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function PurchaseReturnListPage() {
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

  const canAccessPurchaseReturn =
    !isEmployee || canAccess(features, "Purchase", "Purchase Return");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessPurchaseReturn;

  const { data: listData, isFetching: listLoading } =
    useGetPurchaseReturnListQuery(
      { page: currentPage, limit: perPage },
      { skip: status !== "authenticated" || isSearchActive || !shouldFetch }
    );

  const { data: searchData, isFetching: searchLoading } =
    useSearchPurchaseReturnQuery(
      { search: searchText, page: currentPage, limit: perPage },
      { skip: !isSearchActive || status !== "authenticated" }
    );

  const [deletePurchaseReturn] = useDeletePurchaseReturnMutation();
  const [changeStatus] = useChangePurchaseReturnStatusMutation();

  const purchaseReturns = isSearchActive
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

  const handleToggleStatus = (returnId, currentStatus) => {
    const newStatus = currentStatus === "1" ? "0" : "1";
    const statusText = newStatus === "1" ? "RECEIVED" : "NOT RECEIVED";

    setDialogConfig({
      open: true,
      title: "Confirm Status Change",
      description: `Mark this purchase return as ${statusText}?`,
      isDestructive: false,
      onConfirm: async () => {
        setProcessingId(returnId);
        try {
          const payload = { return_id: returnId, status: newStatus };
          const res = await changeStatus(payload).unwrap();
          if (res.success) toast.success("Status updated successfully!");
          else toast.error(res.message || "Status update failed.");
        } catch {
          toast.error("An error occurred while updating status.");
        } finally {
          setProcessingId(null);
          setDialogConfig((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDelete = (id, returnId) => {
    setDialogConfig({
      open: true,
      title: "Confirm Deletion",
      description: `Delete Purchase Return (${returnId}) permanently?`,
      isDestructive: true,
      onConfirm: async () => {
        setProcessingId(id);
        try {
          const res = await deletePurchaseReturn(id).unwrap();
          if (res.success)
            toast.success("Purchase return deleted successfully!");
          else toast.error(res.message || "Deletion failed.");
        } catch {
          toast.error("Error deleting purchase return.");
        } finally {
          setProcessingId(null);
          setDialogConfig((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  if (status === "unauthenticated")
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Please sign in.
      </div>
    );

  return (
    <ProtectedRoute featureName="Purchase" optionName="Purchase Return">
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Purchase Return List
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Invoice or Vendor"
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
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> New Purchase Return
            </Button>
            <CreatePurchaseReturnModal
              open={open}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="grid grid-cols-[2.5fr,1.5fr,1.5fr,1.5fr,1.2fr,1.5fr] gap-4 p-4 bg-gray-100 font-semibold text-gray-700 text-sm">
            <div>Vendor</div>
            <div>Purchase Date</div>
            <div>Return Date</div>
            <div>Return Amount</div>
            <div>Status</div>
            <div className="text-center">Action</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading purchase returns...
            </div>
          ) : purchaseReturns?.length > 0 ? (
            purchaseReturns.map((entry) => {
              const vendorName =
                entry?.vendor?.name ||
                entry?.purchase?.vendor_name ||
                "Unknown Vendor";
              const purchaseDate =
                entry?.purchase?.created_at || entry?.created_at;

              return (
                <div
                  key={entry.id}
                  className="grid grid-cols-[2.5fr,1.5fr,1.5fr,1.5fr,1.2fr,1.5fr] gap-4 items-center p-4 border-b text-sm hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold text-emerald-800">
                      {entry.return_id}
                    </div>
                    <div className="text-xs text-gray-500">{vendorName}</div>
                  </div>
                  <div>{formatDate(purchaseDate)}</div>
                  <div>{formatDate(entry.invoice_date)}</div>
                  <div>{formatAmount(entry.return_amount)}BDT</div>
                  <div className="flex items-center">
                    <Switch
                      checked={entry.return_status === "1"}
                      onCheckedChange={() =>
                        handleToggleStatus(entry.return_id, entry.return_status)
                      }
                      disabled={processingId === entry.return_id}
                    />
                    {processingId === entry.return_id && (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin text-emerald-500" />
                    )}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Link href={`/purchase/return/${entry.return_id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
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
              No purchase return records found.
            </div>
          )}
        </div>

        {/* Pagination & Dialog */}
        {!isSearchActive && pagination && (
          <PurchaseReturnPagination
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
