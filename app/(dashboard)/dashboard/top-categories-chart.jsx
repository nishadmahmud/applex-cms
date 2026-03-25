"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LayoutList } from "lucide-react";
import { useGetMostSellingCategoryDateWiseQuery } from "@/app/store/api/categorySaleReportApi";
import { useSession } from "next-auth/react";

function getDatesFromInterval(interval) {
  const d = new Date();
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  if (interval === "weekly" || interval === "weekly") {
    start.setDate(start.getDate() - 7);
  } else if (interval === "monthly" || interval === "this_month") {
    start.setDate(1); 
  } else if (interval === "yearly") {
    start.setMonth(0, 1);
  }
  return { start_date: start.toISOString(), end_date: end.toISOString() };
}

export default function TopCategoriesChart({ interval }) {
  const { data: session, status } = useSession();
  
  const dates = useMemo(() => getDatesFromInterval(interval), [interval]);
  
  const { data: topRes, isLoading } = useGetMostSellingCategoryDateWiseQuery(
    { ...dates, page: 1, limit: 5 },
    { skip: status !== "authenticated" }
  );

  const chartData = useMemo(() => {
    const list = Array.isArray(topRes?.data?.data) ? topRes.data.data : [];
    return list.map(c => ({
      name: c?.name || "Unknown",
      amount: Number(c?.amount ?? 0)
    }));
  }, [topRes]);

  const formatNum = (v) =>
    v >= 1e9
      ? `${(v / 1e9).toFixed(1)}B`
      : v >= 1e6
        ? `${(v / 1e6).toFixed(1)}M`
        : v >= 1e3
          ? `${(v / 1e3).toFixed(1)}K`
          : v;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <Card className="shadow-sm h-72 md:h-96 transition-all hover:shadow-md bg-card border-border overflow-hidden rounded-md">
      <CardHeader className="p-4 py-3 flex flex-row items-center gap-3 shrink-0 border-b border-gray-100 bg-white">
        <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
          <LayoutList className="w-4 h-4" />
        </div>
        <CardTitle className="text-[13px] font-bold text-gray-900 tracking-wider uppercase m-0 p-0 truncate">
          Top Categories (Revenue)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 relative h-[calc(100%-60px)]">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground font-medium animate-pulse">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground font-medium">
            No category sales
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                tickFormatter={formatNum} 
                axisLine={{ stroke: "hsl(var(--border))" }} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80} 
                tick={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: "bold" }} 
                axisLine={{ stroke: "hsl(var(--border))" }} 
              />
              <Tooltip 
                cursor={{ fill: "transparent" }}
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                formatter={(v) => [`${v.toLocaleString()} BDT`, "Revenue"]} 
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
