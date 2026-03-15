"use client";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { useGetExpenseTypeListQuery } from "@/app/store/api/expenseApi";
import { setToken } from "@/app/store/authSlice";
import ExpenseQuickPaymentCategory from "@/components/ExpenseQuickPaymentCategory";
import ProtectedRoute from "@/components/ProtectedRoute";
import { canAccess } from "@/lib/canAccess";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function Categories() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessExpenseCategoryList =
    !isEmployee || canAccess(features, "Expense", "Expense Category List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessExpenseCategoryList;
  const { data: expenseTypes, isLoading } = useGetExpenseTypeListQuery(
    undefined,
    {
      skip: status !== "authenticated" || !shouldFetch,
    }
  );

  return (
    <ProtectedRoute featureName="Expense" optionName="Expense Category List">
      <div>
        <ExpenseQuickPaymentCategory
          list={expenseTypes?.data}
          isLoading={isLoading}
          type="Expense Category"
          isExpense={true}
        />
      </div>
    </ProtectedRoute>
  );
}
