import StatCard from "./stat-card";
import { ShoppingCart, Activity, Wallet, Handshake, Banknote, PackageOpen, Users, Box } from "lucide-react";

export default function KPIMetrics({ data }) {
  const metrics = [
    {
      title: "Total Sales",
      value: data?.sales || 0,
      currency: "BDT",
      icon: <ShoppingCart />,
      accentColor: "#0073B7",
      link: "/invoice/all-sell-invoice",
    },
    {
      title: "Total Revenue",
      value: data?.revenue || 0,
      currency: "BDT",
      icon: <Activity />,
      accentColor: "#0ea5e9", // Sky-500
      link: "/analytics/monthly-sales-day-counting-report",
    },
    {
      title: "Total Expense",
      value: data?.expense || 0,
      currency: "BDT",
      icon: <Wallet />,
      accentColor: "#64748b", // Slate-500
      link: "/expense/list",
    },
    {
      title: "Total Purchase",
      value: data?.purchase || 0,
      currency: "BDT",
      icon: <Handshake />,
      accentColor: "#6366f1", // Indigo-500
      link: "/analytics/monthly-purchase-day-counting-report",
    },
    {
      title: "Total Balance",
      value: data?.balance || 0,
      currency: "BDT",
      icon: <Banknote />,
      accentColor: "#10b981", // Emerald-500
      link: "/finance/fund-transfer",
    },
    {
      title: "Total Orders",
      value: data?.order || 0,
      icon: <PackageOpen />,
      accentColor: "#f59e0b", // Amber-500
    },
    {
      title: "New Customers",
      value: data?.new_customer || 0,
      icon: <Users />,
      accentColor: "#8b5cf6", // Violet-500
      link: "/sale/customers",
    },
    {
      title: "Current Stock",
      value: data?.current_stock || 0,
      icon: <Box />,
      accentColor: "#0f172a", // Slate-900 (Professional Dark)
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
