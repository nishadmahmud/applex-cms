"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FundHeader from "./components/FundHeader";
import FundTransferForm from "./components/FundTransferForm";
import AddBalanceForm from "./components/AddBalanceForm";
import useFunds from "@/apiHooks/hooks/useFundsQuery";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";

export default function FundsPage() {
  const { data: session, status } = useSession();
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const isEmployee = !!session?.isEmployee;
  const canAccessFundTransfer =
    !isEmployee || canAccess(features, "Finance", "Fund Transfer");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessFundTransfer;

  const {
    data: accounts,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFunds({ enabled: shouldFetch });

  // Initial loading only
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-6">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-2">Failed to load accounts</p>
          <button
            onClick={() => refetch()}
            className="text-blue-600 underline text-sm"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ProtectedRoute featureName={"Finance"} optionName={"Fund Transfer"}>
      <div className="container mx-auto py-6 space-y-8">
        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Updating...
          </div>
        )}

        <FundHeader accounts={accounts} />
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-8">
            {/* Pass refetch to both forms (optional, we also do optimistic updates) */}
            <FundTransferForm accounts={accounts} refetchAccounts={refetch} />
            <AddBalanceForm accounts={accounts} refetchAccounts={refetch} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
