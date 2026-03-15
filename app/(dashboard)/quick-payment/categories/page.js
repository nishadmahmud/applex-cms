"use client";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { useGetPaymentExpenseTypeListQuery } from "@/app/store/api/quickPaymentApi";
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

  const canAccessQuickPaymentCategoryList =
    !isEmployee ||
    canAccess(features, "Quick Payment", "Payment Category List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessQuickPaymentCategoryList;
  const { data, isLoading } = useGetPaymentExpenseTypeListQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });

  return (
    <ProtectedRoute
      featureName={"Quick Payment"}
      optionName={"Payment Category List"}
    >
      <div>
        <ExpenseQuickPaymentCategory
          list={data?.data}
          isLoading={isLoading}
          type="Quick Payment Category"
          isExpense={false}
        />
      </div>
    </ProtectedRoute>
  );
}
