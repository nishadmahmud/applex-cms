import { useMemo } from "react";
import { useGetProfitLossReportQuery } from "@/app/store/api/profitLossReportApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign, WalletCards } from "lucide-react";

// Fallback to inline date utils to avoid import issues
const getDatesFromInterval = (interval) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  end.setHours(23, 59, 59, 999);

  switch (interval) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }

  return {
    start_date: start.toISOString(),
    end_date: end.toISOString()
  };
};

const fmt = (num) => Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function ProfitLossWidget({ interval }) {
  const dates = useMemo(() => getDatesFromInterval(interval), [interval]);

  const { data, isLoading, isError } = useGetProfitLossReportQuery(dates);

  const grossProfit = Number(data?.data?.gross_profit ?? 0);
  const netProfit = Number(data?.data?.net_profit ?? 0);
  const totalExpenses = Number(data?.data?.total_expenses ?? 0);
  const totalIncome = grossProfit; // Often Gross Profit matches income in simple POS structures

  if (isLoading) {
    return (
      <Card className="h-full border-blue-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
            <WalletCards className="w-5 h-5 text-blue-500" /> Income, Expense & Profit
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full border-red-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
            <WalletCards className="w-5 h-5 text-blue-500" /> Income, Expense & Profit
          </CardTitle>
        </CardHeader>
        <CardContent className="h-48 text-center text-red-500 pt-10">
          Failed to load Profit & Loss data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-slate-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
          <WalletCards className="w-5 h-5 text-blue-500" /> Income, Expense & Profit
          <span className="text-xs font-normal text-muted-foreground ml-auto bg-white px-2 py-1 rounded-md border shadow-sm">
            {interval.charAt(0).toUpperCase() + interval.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <div className="grid grid-cols-1 gap-6">
          {/* Net Profit Big Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-20">
              <DollarSign className="w-24 h-24" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1 z-10">Net Profit</p>
            <h4 className="text-4xl font-extrabold tracking-tight z-10">
              ৳ {fmt(netProfit)}
            </h4>
            <div className="mt-2 text-xs opacity-80 z-10 flex items-center gap-1">
              {netProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {netProfit >= 0 ? "Positive" : "Negative"} Balance
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-emerald-800">Gross Profit</span>
              </div>
              <p className="text-xl font-bold text-emerald-700 mt-2">৳ {fmt(totalIncome)}</p>
            </div>

            <div className="flex flex-col p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-rose-100 rounded-md text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-rose-800">Expenses</span>
              </div>
              <p className="text-xl font-bold text-rose-700 mt-2">৳ {fmt(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
