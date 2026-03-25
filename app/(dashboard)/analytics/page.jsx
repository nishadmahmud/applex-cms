"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Calculator,
  ShoppingCart,
  Package,
  Smartphone,
  Warehouse,
  FolderOpen,
  BookOpen,
  FileText,
  Calendar,
  AlertTriangle,
  DollarSign,
  Wallet,
  Users,
  User,
  Clock,
  PieChart,
  Receipt,
  ShoppingBag,
  CreditCard,
  NotebookText,
  User2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/apiHooks/hooks/useCheckRolePermissionsQuery";
import { canAccess } from "@/lib/canAccess";
import Unauthorized from "@/components/Unauthorized";
import ProtectedRoute from "@/components/ProtectedRoute";

export const analyticsReports = [
  // Evan khan told to remove this
  // {
  //   title: "Transaction History",
  //   icon: BarChart3,
  //   link: "/analytics/transaction-history",
  //   bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
  //   textColor: "text-blue-900",
  //   iconColor: "text-blue-600",
  // },
  // Evan khan told to remove this report
  // {
  //   title: "Balance History",
  //   icon: TrendingUp,
  //   link: "/analytics/balance-history",
  //   bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
  //   textColor: "text-emerald-900",
  //   iconColor: "text-emerald-600",
  // },
  {
    title: "Cash Statement Report",
    icon: CreditCard,
    link: "/analytics/cash-statement-report",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    textColor: "text-purple-900",
    iconColor: "text-purple-600",
  },
  {
    title: "Ledger Statement Report",
    icon: NotebookText,
    link: "/analytics/ledger-statement-report",
    bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
    textColor: "text-slate-900",
    iconColor: "text-slate-600",
  },
  {
    title: "Customer due aging Report",
    icon: User2,
    link: "/analytics/customer-due-aging-report",
    bgColor: "bg-gradient-to-br from-red-100 to-red-200",
    textColor: "text-red-900",
    iconColor: "text-red-600",
  },
  {
    title: "Accounting History",
    icon: Calculator,
    link: "/analytics/accounting-history",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    textColor: "text-purple-900",
    iconColor: "text-purple-600",
  },
  {
    title: "Category Sale Report",
    icon: ShoppingCart,
    link: "/analytics/category-sale-report",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    textColor: "text-orange-900",
    iconColor: "text-orange-600",
  },
  {
    title: "Product Sale Report",
    icon: Package,
    link: "/analytics/product-sale-report",
    bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
    textColor: "text-rose-900",
    iconColor: "text-rose-600",
  },
  {
    title: "IMEI/Serial Report",
    icon: Smartphone,
    link: "/analytics/imei-serial-report",
    bgColor: "bg-gradient-to-br from-cyan-50 to-cyan-100",
    textColor: "text-cyan-900",
    iconColor: "text-cyan-600",
  },
  {
    title: "Product Stock Report",
    icon: Warehouse,
    link: "/analytics/product-stock-report",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    textColor: "text-indigo-900",
    iconColor: "text-indigo-600",
  },
  {
    title: "Category Stock Report",
    icon: FolderOpen,
    link: "/analytics/category-stock-report",
    bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
    textColor: "text-teal-900",
    iconColor: "text-teal-600",
  },
  {
    title: "Ledger Report History",
    icon: BookOpen,
    link: "/analytics/ledger-report-history",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    textColor: "text-amber-900",
    iconColor: "text-amber-600",
  },
  {
    title: "Balance Sheet Report History",
    icon: FileText,
    link: "/analytics/balance-sheet-report-history",
    bgColor: "bg-gradient-to-br from-lime-50 to-lime-100",
    textColor: "text-lime-900",
    iconColor: "text-lime-600",
  },
  {
    title: "Sales Register Report",
    icon: Receipt,
    link: "/analytics/sales-register-report",
    bgColor: "bg-gradient-to-br from-pink-50 to-pink-100",
    textColor: "text-pink-900",
    iconColor: "text-pink-600",
  },
  {
    title: "Monthly Sales Day Counting Report",
    icon: Calendar,
    link: "/analytics/monthly-sales-day-counting-report",
    bgColor: "bg-gradient-to-br from-violet-50 to-violet-100",
    textColor: "text-violet-900",
    iconColor: "text-violet-600",
  },
  {
    title: "Monthly Purchase Day Counting Report",
    icon: Calendar,
    link: "/analytics/monthly-purchase-day-counting-report",
    bgColor: "bg-gradient-to-br from-sky-50 to-sky-100",
    textColor: "text-sky-900",
    iconColor: "text-sky-600",
  },
  // {
  //   title: "Minimum Stock Report",
  //   icon: AlertTriangle,
  //   link: "/analytics/minimum-stock-report",
  //   bgColor: "bg-gradient-to-br from-red-50 to-red-100",
  //   textColor: "text-red-900",
  //   iconColor: "text-red-600",
  // },
  {
    title: "Profit And Loss Account Report",
    icon: DollarSign,
    link: "/analytics/profit-loss-report",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    textColor: "text-green-900",
    iconColor: "text-green-600",
  },
  {
    title: "Cash Book Details History",
    icon: Wallet,
    link: "/analytics/cash-book-details-history",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100",
    textColor: "text-slate-900",
    iconColor: "text-slate-600",
  },
  {
    title: "Cash Book Summary Report",
    icon: Wallet,
    link: "/analytics/cash-book-summary-report",
    bgColor: "bg-gradient-to-br from-zinc-50 to-zinc-100",
    textColor: "text-zinc-900",
    iconColor: "text-zinc-600",
  },
  {
    title: "Store Ledger Report",
    icon: BookOpen,
    link: "/analytics/store-ledger-report",
    bgColor: "bg-gradient-to-br from-neutral-50 to-neutral-100",
    textColor: "text-neutral-900",
    iconColor: "text-neutral-600",
  },
  {
    title: "Transaction Summary Report",
    icon: BarChart3,
    link: "/analytics/transaction-summary-report",
    bgColor: "bg-gradient-to-br from-stone-50 to-stone-100",
    textColor: "text-stone-900",
    iconColor: "text-stone-600",
  },
  {
    title: "Due Report History",
    icon: Clock,
    link: "/analytics/due-report-history",
    bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    textColor: "text-yellow-900",
    iconColor: "text-yellow-600",
  },
  {
    title: "Customer Summary Report",
    icon: Users,
    link: "/analytics/customer-summary-report",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    textColor: "text-blue-900",
    iconColor: "text-blue-600",
  },
  {
    title: "Customer Wise Due Report",
    icon: User,
    link: "/analytics/customer-wise-due-report",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
    textColor: "text-emerald-900",
    iconColor: "text-emerald-600",
  },
  {
    title: "Employee Wise Sales Report",
    icon: User,
    link: "/analytics/employee-wise-sales-report",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-100",
    textColor: "text-purple-900",
    iconColor: "text-purple-600",
  },
  {
    title: "Month Wise Report",
    icon: Calendar,
    link: "/analytics/month-wise-report",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-100",
    textColor: "text-orange-900",
    iconColor: "text-orange-600",
  },
  {
    title: "Expense Type Wise Report",
    icon: PieChart,
    link: "/analytics/expense-type-wise-report",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-100",
    textColor: "text-rose-900",
    iconColor: "text-rose-600",
  },
  {
    title: "Sales Register Details Report",
    icon: Receipt,
    link: "/analytics/sales-register-details-report",
    bgColor: "bg-gradient-to-br from-cyan-50 to-blue-100",
    textColor: "text-cyan-900",
    iconColor: "text-cyan-600",
  },
  {
    title: "Purchase Register Details Report",
    icon: ShoppingBag,
    link: "/analytics/purchase-register-details-report",
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-100",
    textColor: "text-indigo-900",
    iconColor: "text-indigo-600",
  },
  {
    title: "Sales Quantity Report",
    icon: BarChart3,
    link: "/analytics/sales-quantity-report",
    bgColor: "bg-gradient-to-br from-teal-50 to-emerald-100",
    textColor: "text-teal-900",
    iconColor: "text-teal-600",
  },
];

export default function AnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: session, status: sessionStatus } = useSession();
  const { data: features, isLoading } = useRolePermissions();

  const isEmployee = session?.isEmployee;

  // 🔒 Block rendering until we know permissions for employees
  const stillLoadingPermissions =
    sessionStatus === "loading" || (isEmployee && (isLoading || !features));

  if (stillLoadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // 🧠 If this user is an employee and does NOT have Analytics feature, block
  if (isEmployee && features && !canAccess(features, "Analytics")) {
    return <Unauthorized />;
  }

  const handleCardClick = (link) => {
    // You can implement navigation logic here
    console.log(`Navigating to: ${link}`);
    // For Next.js routing: router.push(link)
  };

  const filteredReports = analyticsReports.filter((report) => {
    // 1. Check if allowed by role (if employee)
    if (isEmployee && features) {
      if (!canAccess(features, "Analytics", report.title)) {
        return false;
      }
    }
    // 2. Check search term
    return report.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <ProtectedRoute featureName="Analytics">
      <div className="min-h-screen bg-gray-50 px-2 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left Side - Title & Subtitle */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Comprehensive business reports and insights
              </p>
            </div>

            {/* Right Side - Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search reports by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {/* Search Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <Link href={`${report?.link}`} key={index}>
                  <Card
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex group"
                    onClick={() => handleCardClick(report.link)}
                  >
                    <CardContent className="p-5 flex items-center justify-start text-left w-full gap-4">
                      <div
                        className={`p-3 rounded-xl ${report.bgColor || 'bg-gray-50'} ${report.iconColor || 'text-gray-600'} transition-transform group-hover:scale-105`}
                      >
                        <IconComponent size={24} />
                      </div>
                      <h3
                        className="font-semibold text-[15px] text-gray-800 leading-tight"
                      >
                        {report.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No reports found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
