"use client";
import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { useGetEmployeeWiseSalesQuery } from "@/app/store/api/employeeWiseSalesReportApi";

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
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
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

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#6366f1", // indigo-500
];

export default function EmployeeSalesChart({ interval }) {
  const dates = useMemo(() => getDatesFromInterval(interval), [interval]);

  // Fetch all employee sales exactly like how employees-salary page does it
  const { data: salesRes, isLoading, isError } = useGetEmployeeWiseSalesQuery({
    start_date: dates.start_date,
    end_date: dates.end_date,
    employee_id: "" // Empty string fetches all employees' sales
  });

  const { chartData, employeeNames } = useMemo(() => {
    // Determine the array source from the API response
    const rows = Array.isArray(salesRes?.data) ? salesRes.data : 
                 Array.isArray(salesRes?.data?.data) ? salesRes.data.data : [];
                 
    if (!rows.length) return { chartData: [], employeeNames: [] };

    const dateMap = {}; // { 'YYYY-MM-DD': { date: 'YYYY-MM-DD', EmployeeA: 100, EmployeeB: 50... } }
    const empSet = new Set();
    
    rows.forEach(r => {
      if (!r?.date) return;
      const dt = r.date.split(' ')[0]; // Extract just the YYYY-MM-DD portion
      const empName = r.employee_name || "Unknown";
      empSet.add(empName);
      
      if (!dateMap[dt]) {
        dateMap[dt] = { date: dt };
      }
      if (!dateMap[dt][empName]) {
        dateMap[dt][empName] = 0;
      }
      
      // employee-wise-sales data typically has paid_amount or sale_amount
      dateMap[dt][empName] += Number(r.paid_amount ?? r.sale_amount ?? r.grand_total ?? 0);
    });

    const formattedData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const names = Array.from(empSet);
    
    // Fill in 0s for employees that didn't sell on a specific date to prevent Recharts rendering issues
    formattedData.forEach(day => {
       names.forEach(n => {
          if (day[n] === undefined) day[n] = 0;
       });
    });

    return { chartData: formattedData, employeeNames: names };
  }, [salesRes]);

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="py-4 border-b border-slate-100 bg-slate-50/30">
        <CardTitle className="text-lg font-bold flex justify-between items-center text-slate-800 tracking-tight">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100/50 rounded-md">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            Sales by Employee
          </div>
          <span className="text-xs font-normal text-slate-500 bg-white px-2.5 py-1 rounded-full border shadow-sm">
            {interval ? interval.charAt(0).toUpperCase() + interval.slice(1) : "Overall"}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center flex-col items-center h-72 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium animate-pulse">Fetching Unified Sales Data...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-72 text-red-500 font-medium">
            Error loading employee sales chart
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-72 text-slate-400 italic">
            No sales record for this period.
          </div>
        ) : (
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {employeeNames.map((empName, i) => {
                    const safeId = empName.replace(/[^a-zA-Z0-9]/g, "");
                    return (
                      <linearGradient key={`color-${safeId}`} id={`color-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis 
                   tickLine={false} 
                   axisLine={false} 
                   tickMargin={10} 
                   tick={{ fill: "#64748b", fontSize: 12 }}
                   tickFormatter={(value) => `৳ ${(value/1000).toFixed(0)}k`} 
                />
                <Tooltip 
                   contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", zIndex: 10 }}
                   itemStyle={{ fontWeight: "bold" }}
                   cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                
                {employeeNames.map((empName, i) => {
                  const safeId = empName.replace(/[^a-zA-Z0-9]/g, "");
                  return (
                    <Area
                      key={empName}
                      type="monotone"
                      dataKey={empName}
                      stroke={COLORS[i % COLORS.length]}
                      fillOpacity={1}
                      fill={`url(#color-${safeId})`}
                      strokeWidth={2}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
