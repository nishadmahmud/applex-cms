"use client";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { useGetPaymentExpenseListQuery } from "@/app/store/api/quickPaymentApi";
import { setToken } from "@/app/store/authSlice";
import ExpenseQuickPaymentListUi from "@/components/ExpenseQuickPaymentListUi";
import ProtectedRoute from "@/components/ProtectedRoute";
import { canAccess } from "@/lib/canAccess";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const QuickPaymentList = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      dispatch(setToken(session.user.token));
    }
  }, [status, session, dispatch]);

  const isEmployee = !!session?.isEmployee;
  const { data: features, isLoading: permLoading } = useRolePermissions();

  const canAccessQuickPaymentList =
    !isEmployee || canAccess(features, "Quick Payment", "Quick Payment List");
  const permissionsReady = !permLoading && status === "authenticated";
  const shouldFetch = permissionsReady && canAccessQuickPaymentList;
  const { data, isLoading } = useGetPaymentExpenseListQuery(undefined, {
    skip: status !== "authenticated" || !shouldFetch,
  });

  return (
    <ProtectedRoute featureName="Quick Payment" optionName="Quick Payment List">
      <div>
        <ExpenseQuickPaymentListUi
          list={data?.data?.data}
          isLoading={isLoading}
          type="Quick Payment List"
          isExpense={false}
        />
      </div>
    </ProtectedRoute>
  );
};

export default QuickPaymentList;
