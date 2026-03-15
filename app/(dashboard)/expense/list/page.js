"use client";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { useGetExpenseListQuery } from "@/app/store/api/expenseApi";
import { setToken } from "@/app/store/authSlice";
import ExpenseQuickPaymentListUi from "@/components/ExpenseQuickPaymentListUi";
import ProtectedRoute from "@/components/ProtectedRoute";
import { canAccess } from "@/lib/canAccess";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function ExpenseList() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessExpenseList =
    !isEmployee || canAccess(features, "Expense", "Expense List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessExpenseList;

  const { data: expenseList, isLoading } = useGetExpenseListQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });

  return (
    <ProtectedRoute featureName="Expense" optionName="Expense List">
      <ExpenseQuickPaymentListUi
        list={expenseList?.data?.data}
        isLoading={isLoading}
        type="Expense List"
        isExpense={true}
      />
    </ProtectedRoute>
  );
}
