"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import KPIMetrics from "./kpi-metrics";
import BarChartCard from "./bar-chart-card";
import MostSellingRadialChart from "./most-selling-radial-chart";
import InvoiceTable from "./invoice-table";
import { Skeleton } from "@/components/ui/skeleton";
import useDashboard from "@/apiHooks/hooks/useDashboardApi";
import IntervalSelector from "./interval-selector";
import { useSaleInvoices } from "@/apiHooks/hooks/useSaleInvoices";
import { usePurchaseInvoices } from "@/apiHooks/hooks/usePurchaseInvoices";
import BestSellingProducts from "./best-selling-products";
import AreaChartCard from "./area-char-expense";
import useSalesTargetSummary from "@/apiHooks/hooks/useSalesTargetSummary";
import CashBalanceCard from "./cash-balance-card";
import ProfitLossWidget from "./profit-loss-widget";
import TopTablesWidget from "./top-tables-widget";
import EmployeeSalesChart from "./employee-sales-chart";
import BusinessInsights from "./business-insights";
import ExpenseDonutChart from "./expense-donut-chart";
import TopCategoriesChart from "./top-categories-chart";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const [interval, setInterval] = useState("daily");

  const isAuthenticated = status === "authenticated";

  const { data, isLoading, isError, error } = useDashboard(interval, {
    enabled: isAuthenticated,
  });

  const { saleInvoiceItems, isSaleInvoiceLoading } = useSaleInvoices(1, 10, {
    enabled: isAuthenticated,
  });

  const targetDate = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  const { data: targetSummary } = useSalesTargetSummary(targetDate, {
    enabled: isAuthenticated,
  });

  const { purchaseInvoiceItems, isPurchaseInvoiceLoading } = usePurchaseInvoices(1, 10, {
    enabled: isAuthenticated,
  });

  const dashboardData = data?.data ?? data;
  const purchaseInvoices =
    purchaseInvoiceItems?.data?.data ??
    purchaseInvoiceItems?.purchase_invoice ??
    purchaseInvoiceItems ??
    [];

  // Only block render while session resolves (usually < 200ms)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen p-6">
        <p className="text-red-600">
          You are not signed in. Please sign in to see the dashboard.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-6">
        <p className="text-red-600">Error loading dashboard: {error?.message}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute featureName="Dashboard">
      <div className="min-h-screen bg-background text-foreground">
        {/* Header — always visible instantly */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">
                  Welcome back to{" "}
                  <span className="font-semibold font-mono text-primary">
                    {session?.user?.outlet_name}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-6">
                <IntervalSelector value={interval} onChange={setInterval} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

          {/* Business Insights — Arctic Style */}
          <div className="mb-4 md:mb-8">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : dashboardData ? (
              <BusinessInsights data={dashboardData} />
            ) : null}
          </div>

          {/* KPI Metrics — loads independently */}
          <div className="mb-4 md:mb-8">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : dashboardData ? (
              <KPIMetrics data={dashboardData} />
            ) : null}
          </div>

          {/* Top Performers (Top Customers, Receivables, Payables) */}
          <div className="mb-4 md:mb-8">
            <TopTablesWidget />
          </div>

          {/* Profit & Loss + Employee Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
            <ProfitLossWidget data={dashboardData} interval={interval} />
            <EmployeeSalesChart interval={interval} />
          </div>

          {/* Charts — load independently */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </>
            ) : (
              <>
                <BarChartCard
                  title="Revenue Overview"
                  color="#3b82f6"
                  dataKey="Revenue"
                  data={
                    dashboardData?.revenue_chart?.map((d) => ({
                      name: d.name,
                      Revenue: parseFloat(d.amount),
                    })) || []
                  }
                />
                <MostSellingRadialChart salesTarget={targetSummary} />
              </>
            )}
          </div>

          {/* New Advanced Charts (Top Categories & Expense Breakdown) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
             <TopCategoriesChart interval={interval} />
             <ExpenseDonutChart interval={interval} />
          </div>

          {/* Best Selling + Expense Trends — renders when data arrives */}
          {dashboardData?.most_selling && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
              <AreaChartCard
                title="Expense Trends"
                color="#ec4899"
                dataKey="Expense"
                data={
                  dashboardData?.expense_chart?.map((d) => ({
                    name: d.name,
                    Expense: parseFloat(d.amount),
                  })) || []
                }
              />
              <BestSellingProducts products={dashboardData.most_selling} />
            </div>
          )}

          {/* Invoice Tables — each table loads independently */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
            {isSaleInvoiceLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <InvoiceTable
                title="Recent Selling Invoice"
                invoices={saleInvoiceItems?.data}
                type="selling"
              />
            )}
            {isPurchaseInvoiceLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <InvoiceTable
                title="Recent Purchase Invoice"
                invoices={purchaseInvoices?.data}
                type="purchase"
              />
            )}
          </div>

          {/* Cash, Bank & Mobile Balance */}
          <div className="mb-4 md:mb-8">
            <CashBalanceCard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
