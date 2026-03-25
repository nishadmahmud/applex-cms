"use client";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useGetExpenseListQuery } from "@/app/store/api/expenseApi";
import { useSession } from "next-auth/react";

function getDatesFromInterval(interval) {
  const d = new Date();
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  let start = new Date(d);
  start.setHours(0, 0, 0, 0);

  if (!interval || interval === "overall") {
    start = new Date("2000-01-01"); // Very early date to include all data
  } else if (interval === "weekly" || interval === "weekly") {
    start.setDate(start.getDate() - 7);
  } else if (interval === "monthly" || interval === "this_month") {
    start.setDate(1); // Start of current month is usually better for "monthly"
  } else if (interval === "yearly") {
    start.setMonth(0, 1); // Start of year
  }
  return { start_date: start.toISOString(), end_date: end.toISOString() };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#94a3b8"];

export default function ExpenseDonutChart({ interval }) {
  const { data: session, status } = useSession();
  
  const dates = useMemo(() => getDatesFromInterval(interval), [interval]);
  
  const { data: listRes, isLoading } = useGetExpenseListQuery(undefined, {
    skip: status !== "authenticated"
  });

  const chartData = useMemo(() => {
    // Extract array from standard Laravel paginated/wrapped response
    const rows = Array.isArray(listRes?.data?.data) ? listRes.data.data : 
                 Array.isArray(listRes?.data) ? listRes.data : [];
    
    // Group by category_name (or catogory_name)
    const grouped = {};
    const startDate = new Date(dates.start_date);
    const endDate = new Date(dates.end_date);

    rows.forEach(r => {
      // Extremely resilient fallback to map category
      const cat = r?.expense_type?.expense_name || r?.catogory_name || r?.category_name || r?.expense_name || "Uncategorized";
      const amt = Number(r?.paid_amount ?? r?.amount ?? r?.expense_amount ?? 0);
      
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += amt;
    });

    // Sort descending
    const sorted = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); 
      
    // If there are more than 6, slice to top 5 and group the rest into 'Others'
    if (sorted.length > 5) {
      const top5 = sorted.slice(0, 5);
      const othersValue = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
      if (othersValue > 0) {
        top5.push({ name: "Others", value: othersValue });
      }
      return top5;
    }

    return sorted;
  }, [listRes, dates]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
          <p className="font-bold text-sm text-slate-800">{data.name}</p>
          <p className="text-sm font-semibold text-rose-600 mt-1">
            ৳ {data.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm h-80 md:h-96 bg-card border-border transition-all hover:shadow-md overflow-hidden rounded-md">
      <CardHeader className="p-4 py-3 flex flex-row items-center gap-3 shrink-0 border-b border-gray-100 bg-white">
        <div className="w-8 h-8 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-600">
          <CreditCard className="w-4 h-4" />
        </div>
        <CardTitle className="text-[13px] font-bold text-gray-900 tracking-wider uppercase m-0 p-0 truncate">
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 bg-white/50 pt-4 flex flex-col h-[calc(100%-60px)] relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-medium animate-pulse">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground font-medium p-4 text-center">
            <span className="text-gray-900 font-bold mb-1">No expenses found for this interval</span>
          </div>
        ) : (
          <div className="flex-1 min-h-[0px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                barSize={20}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                  width={110}
                />
                <Tooltip cursor={{ fill: "transparent" }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  label={{ 
                    position: 'right', 
                    fill: '#64748b', 
                    fontSize: 11,
                    formatter: (val) => `৳ ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === "Others" ? "#94a3b8" : COLORS[index % (COLORS.length - 1)]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
