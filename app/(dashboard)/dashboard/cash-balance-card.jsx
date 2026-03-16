"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Landmark, Wallet, Smartphone } from "lucide-react";
import useFunds from "@/apiHooks/hooks/useFundsQuery";

// Determine icon & color based on account name
function getAccountMeta(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("cash"))
    return { icon: <Wallet className="w-4 h-4" />, color: "bg-emerald-600" };
  if (
    n.includes("bkash") ||
    n.includes("nagad") ||
    n.includes("mobile") ||
    n.includes("rocket") ||
    n.includes("upay")
  )
    return {
      icon: <Smartphone className="w-4 h-4" />,
      color: "bg-rose-600",
    };
  return { icon: <Landmark className="w-4 h-4" />, color: "bg-blue-700" };
}

export default function CashBalanceCard() {
  const { data: accounts, isLoading } = useFunds();

  if (isLoading) {
    return (
      <Card className="shadow-sm rounded-lg overflow-hidden animate-pulse border-gray-100">
        <div className="h-12 border-b border-gray-100" />
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-50 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!accounts || accounts.length === 0) return null;

  // Sort: cash first, then mobile, then banks
  const sorted = [...accounts].sort((a, b) => {
    const order = (name) => {
      const n = (name || "").toLowerCase();
      if (n.includes("cash")) return 0;
      if (
        n.includes("bkash") ||
        n.includes("nagad") ||
        n.includes("mobile") ||
        n.includes("rocket")
      )
        return 1;
      return 2;
    };
    return order(a.name) - order(b.name);
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);

  return (
    <Card className="shadow-sm rounded-lg overflow-hidden flex flex-col h-full border-gray-100 bg-white">
      <CardHeader className="p-4 py-3 flex flex-row items-center gap-3 shrink-0 border-b border-gray-100">
        <div className="w-8 h-8 rounded-md bg-[#0073B7]/10 flex items-center justify-center text-[#0073B7]">
          <Landmark className="w-4 h-4" />
        </div>
        <CardTitle className="text-[13px] font-bold text-gray-900 tracking-wider uppercase m-0 p-0">
          Financial Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[420px]">
        <div className="divide-y divide-gray-50">
          {sorted.map((account) => {
            const meta = getAccountMeta(account.name);
            const bal = Number(account.paymentcategory_sum_payment_amount || 0);
            return (
              <div
                key={account.id}
                className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div
                  className={`${meta.color} w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm`}
                >
                  {React.cloneElement(meta.icon, { className: "w-5 h-5" })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-extrabold text-gray-900 truncate">
                    BDT {formatCurrency(bal)}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter truncate">
                    {account.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
