"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function RevenueExpenseChart({
  revenueData,
  expenseData,
  interval,
}) {
  // Format data for the chart
  const formatChartData = () => {
    if (interval === "yearly") {
      // For yearly, show revenue chart
      return (
        revenueData?.map((item) => ({
          name: item.name,
          Revenue: Number.parseFloat(item.amount) || 0,
        })) || []
      );
    } else {
      // For other intervals, show expense chart
      return (
        expenseData?.map((item) => ({
          name: item.name,
          Expense: Number.parseFloat(item.amount) || 0,
        })) || []
      );
    }
  };

  const chartData = formatChartData();
  const title = interval === "yearly" ? "Revenue Overview" : "Expense Overview";

  const formatYAxis = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

  const formatTooltip = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            {interval === "yearly" ? (
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            ) : (
              <Bar dataKey="Expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
