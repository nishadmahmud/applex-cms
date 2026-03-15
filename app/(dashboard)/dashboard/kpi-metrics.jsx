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
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      link: "/invoice/all-sell-invoice", // New link property
    },
    {
      title: "Total Revenue",
      value: data?.revenue || 0,
      currency: "BDT",
      trend: data?.revenue_percentage || "0%",
      trendText: data?.revenue_report || "",
      icon: "💰",
      color: "from-green-50 to-green-100",
      textColor: "text-green-600",
      link: "/analytics/monthly-sales-day-counting-report",
    },
    {
      title: "Total Expense",
      value: data?.expense || 0,
      currency: "BDT",
      trend: data?.expense_percentage || "0%",
      trendText: data?.expense_report || "",
      icon: "💸",
      color: "from-red-50 to-red-100",
      textColor: "text-red-600",
      link: "/expense/list",
    },
    {
      title: "Total Purchase",
      value: data?.purchase || 0,
      currency: "BDT",
      icon: "🛒",
      color: "from-orange-50 to-orange-100",
      textColor: "text-orange-600",
      link: "/analytics/monthly-purchase-day-counting-report",
    },
    {
      title: "Total Balance",
      value: data?.balance || 0,
      currency: "BDT",
      trend: data?.balance_percentage || "0%",
      trendText: data?.balance_report || "",
      icon: "💵",
      color: "from-indigo-50 to-indigo-100",
      textColor: "text-indigo-600",
      link: "/finance/fund-transfer",
    },
    {
      title: "Total Orders",
      value: data?.order || 0,
      trend: data?.order_percentage || "0%",
      icon: "📦",
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "New Customers",
      value: data?.new_customer || 0,
      trend: data?.customer_percentage || "0%",
      icon: "👥",
      color: "from-teal-50 to-teal-100",
      textColor: "text-teal-600",
      link: "/sale/customers",
    },
    {
      title: "Current Stock",
      value: data?.current_stock || 0,
      icon: "📦",
      color: "from-cyan-50 to-cyan-100",
      textColor: "text-cyan-600",
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
