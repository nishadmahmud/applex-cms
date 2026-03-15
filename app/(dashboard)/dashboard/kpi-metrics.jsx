import StatCard from "./stat-card";
import { ShoppingCart, Activity, Wallet, Handshake, Banknote, PackageOpen, Users, Box } from "lucide-react";

export default function KPIMetrics({ data }) {
  const metrics = [
    {
      title: "Total Sales",
      value: data?.sales || 0,
      currency: "BDT",
      icon: <ShoppingCart className="w-10 h-10" />,
      gradientClass: "bg-[#0073B7]",
      link: "/invoice/all-sell-invoice",
    },
    {
      title: "Total Revenue",
      value: data?.revenue || 0,
      currency: "BDT",
      icon: <Activity className="w-10 h-10" />,
      gradientClass: "bg-[#005c97]",
      link: "/analytics/monthly-sales-day-counting-report",
    },
    {
      title: "Total Expense",
      value: data?.expense || 0,
      currency: "BDT",
      icon: <Wallet className="w-10 h-10" />,
      gradientClass: "bg-slate-700",
      link: "/expense/list",
    },
    {
      title: "Total Purchase",
      value: data?.purchase || 0,
      currency: "BDT",
      icon: <Handshake className="w-10 h-10" />,
      gradientClass: "bg-sky-700",
      link: "/analytics/monthly-purchase-day-counting-report",
    },
    {
      title: "Total Balance",
      value: data?.balance || 0,
      currency: "BDT",
      icon: <Banknote className="w-10 h-10" />,
      gradientClass: "bg-teal-700",
      link: "/finance/fund-transfer",
    },
    {
      title: "Total Orders",
      value: data?.order || 0,
      icon: <PackageOpen className="w-10 h-10" />,
      gradientClass: "bg-indigo-700",
    },
    {
      title: "New Customers",
      value: data?.new_customer || 0,
      icon: <Users className="w-10 h-10" />,
      gradientClass: "bg-blue-800",
      link: "/sale/customers",
    },
    {
      title: "Current Stock",
      value: data?.current_stock || 0,
      icon: <Box className="w-10 h-10" />,
      gradientClass: "bg-[#003f6b]",
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
