"use client";
import React from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDashboardDataQuery } from "@/app/store/api/dashboardApi";

export default function EarningsChart({ currentInterval, onIntervalChange }) {
  const { data } = useGetDashboardDataQuery({ interval: currentInterval });
  const dashboardData = data?.data;

  console.log(dashboardData);

  // Format chart data based on interval
  const formatChartData = () => {
    if (currentInterval === "yearly") {
      // Show revenue chart for yearly
      return (
        dashboardData?.revenue_chart?.map((item) => ({
          name: item.name,
          Revenue: Number.parseFloat(item.amount) || 0,
        })) || []
      );
    } else {
      // Show expense chart for other intervals
      return (
        dashboardData?.expense_chart?.map((item) => ({
          name: item.name,
          Expense: Number.parseFloat(item.amount) || 0,
        })) || []
      );
    }
  };

  const chartData = formatChartData();
  const title =
    currentInterval === "yearly" ? "Revenue Overview" : "Expense Overview";

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
    <Card className="shadow-sm h-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {currentInterval === "yearly"
                ? "Yearly revenue comparison"
                : "Expense breakdown"}
            </CardDescription>
          </div>
          <Tabs value={currentInterval} onValueChange={onIntervalChange}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {currentInterval === "yearly" ? (
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
