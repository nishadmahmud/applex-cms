import { Wallet, Activity, CreditCard, ShoppingBag, Truck, Receipt, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // You usually have a format function, let's use a safe format

const fmt = (num) => Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function BusinessInsights({ data }) {
  // We'll mimic the Arctic System "Business Insights"
  // Total Purchase, Expense, Receipt, Sales, Service, Payment
  
  const insights = [
    {
      title: "Total Purchase",
      amount: data?.purchase || 0,
      icon: <ShoppingCart className="w-5 h-5 text-indigo-500" />,
      bg: "bg-indigo-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-100",
    },
    {
      title: "Total Expense",
      amount: data?.expense || 0,
      icon: <CreditCard className="w-5 h-5 text-slate-500" />,
      bg: "bg-slate-50",
      textColor: "text-slate-700",
      borderColor: "border-slate-100",
    },
    {
      // Using `revenue` or `receipt` if available
      title: "Total Receipts",
      amount: data?.revenue || 0, // Fallback to revenue
      icon: <Receipt className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-100",
    },
    {
      title: "Total Sales",
      amount: data?.sales || 0,
      icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-100",
    },
    {
      title: "Total Service",
      amount: data?.service || 0, // Fallback if no service data
      icon: <Activity className="w-5 h-5 text-violet-500" />,
      bg: "bg-violet-50",
      textColor: "text-violet-700",
      borderColor: "border-violet-100",
    },
    {
      title: "Total Payments",
      amount: data?.payment || 0, // Fallback if no payment data
      icon: <Wallet className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
      textColor: "text-rose-700",
      borderColor: "border-rose-100",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 w-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" /> Business Insights
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col p-3 rounded-lg border ${item.bg} ${item.borderColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white rounded-md max-w-max shadow-sm">
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-slate-600 line-clamp-1">{item.title}</span>
            </div>
            <div className={`text-sm md:text-base font-bold ${item.textColor} mt-auto`}>
              ৳ {fmt(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
