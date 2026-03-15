import StatCard from "./stat-card";

export default function KPIMetrics({ data }) {
  const metrics = [
    {
      title: "Total Sales",
      value: data?.sales || 0,
      currency: "BDT",
      trend: data?.sales_change || "0%",
      trendText: data?.sales_report || "",
      icon: "📊",
      accentColor: "text-blue-500",
      link: "/invoice/all-sell-invoice",
    },
    {
      title: "Total Revenue",
      value: data?.revenue || 0,
      currency: "BDT",
      trend: data?.revenue_percentage || "0%",
      trendText: data?.revenue_report || "",
      icon: "💰",
      accentColor: "text-emerald-500",
      link: "/analytics/monthly-sales-day-counting-report",
    },
    {
      title: "Total Expense",
      value: data?.expense || 0,
      currency: "BDT",
      trend: data?.expense_percentage || "0%",
      trendText: data?.expense_report || "",
      icon: "💸",
      accentColor: "text-rose-500",
      link: "/expense/list",
    },
    {
      title: "Total Purchase",
      value: data?.purchase || 0,
      currency: "BDT",
      icon: "🛒",
      accentColor: "text-amber-500",
      link: "/analytics/monthly-purchase-day-counting-report",
    },
    {
      title: "Total Balance",
      value: data?.balance || 0,
      currency: "BDT",
      trend: data?.balance_percentage || "0%",
      trendText: data?.balance_report || "",
      icon: "💵",
      accentColor: "text-indigo-500",
      link: "/finance/fund-transfer",
    },
    {
      title: "Total Orders",
      value: data?.order || 0,
      trend: data?.order_percentage || "0%",
      icon: "📦",
      accentColor: "text-purple-500",
    },
    {
      title: "New Customers",
      value: data?.new_customer || 0,
      trend: data?.customer_percentage || "0%",
      icon: "👥",
      accentColor: "text-teal-500",
      link: "/sale/customers",
    },
    {
      title: "Current Stock",
      value: data?.current_stock || 0,
      icon: "📦",
      accentColor: "text-cyan-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric) => (
        <StatCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
