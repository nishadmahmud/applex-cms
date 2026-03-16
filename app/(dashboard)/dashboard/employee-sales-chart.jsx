import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import api from "@/lib/api";

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
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const { start_date, end_date } = getDatesFromInterval(interval);
        
        // 1. Fetch all employees
        const empRes = await api.get("/employee");
        // employee API often returns data directly inside data, or data.data
        const rawData = empRes?.data?.data || empRes?.data || [];
        const allEmployees = Array.isArray(rawData) ? rawData : [];
        
        // Filter active ones (status "1" or true, limit to maybe first 8 to avoid overwhelming the chart, though let's keep it dynamic)
        const activeEmployees = allEmployees.filter(e => e.status === "1" || String(e.status) === "1").slice(0, 10);
        
        // 2. Fetch sales for each employee
        const salesPromises = activeEmployees.map(emp => 
          api.post("/employee-wise-sales", {
            employee_id: emp.id,
            start_date,
            end_date
          }).then(res => ({
            empId: emp.id,
            empName: emp.name,
            totalSales: Number(res.data?.grand_total ?? 0),
            invoices: Array.isArray(res.data?.data) ? res.data.data : []
          })).catch(() => null)
        );

        const results = await Promise.all(salesPromises);
        const validResults = results.filter(Boolean);

        if (!isMounted) return;

        // Formulate simply total bar data (instead of dense time-series which is hard without proper grouping, this ensures beautiful visualization)
        // Wait, area chart for total sales? Area chart usually requires X-axis to be time.
        // Let's create an aggregate time-series grouped by date.

        // Create a unique set of dates
        const dateMap = {}; // { 'YYYY-MM-DD': { date: 'YYYY-MM-DD', EmployeeA: 100, EmployeeB: 50... } }
        
        // Initialize employees in data
        const empNames = validResults.map(r => r.empName);
        
        validResults.forEach(r => {
          r.invoices.forEach(inv => {
            if (!inv.date) return;
            const dt = inv.date.slice(0, 10); // Simple short date
            if (!dateMap[dt]) {
              dateMap[dt] = { date: dt };
              empNames.forEach(name => dateMap[dt][name] = 0);
            }
            dateMap[dt][r.empName] += Number(inv.paid_amount || inv.grand_total || 0); // Aggregate
          });
        });

        // Convert dateMap to array and sort
        let formattedData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        // If no time-series data found (empty intervals), just show a summary bar chart style or an empty state 
        if (formattedData.length === 0) {
           formattedData = [{ date: "No data" }];
           empNames.forEach(name => formattedData[0][name] = 0);
        }

        setChartData(formattedData);
        setEmployeesData(validResults.filter(r => r.totalSales > 0)); 
      } catch (err) {
        console.error("Failed to load employee sales", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [interval]);

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
            {interval.charAt(0).toUpperCase() + interval.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center flex-col items-center h-72 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium animate-pulse">Aggregating Sales Data...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-72 text-red-500 font-medium">
            Error loading employee sales chart
          </div>
        ) : employeesData.length === 0 && (!chartData[0] || chartData[0].date === "No data") ? (
          <div className="flex justify-center items-center h-72 text-slate-400 italic">
            No sales record for this period.
          </div>
        ) : (
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {employeesData.map((emp, i) => (
                    <linearGradient key={`color-${emp.empName}`} id={`color-${emp.empName}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
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
                   contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                   itemStyle={{ fontWeight: "bold" }}
                   cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                
                {employeesData.map((emp, i) => (
                  <Area
                    key={emp.empName}
                    type="monotone"
                    dataKey={emp.empName}
                    stroke={COLORS[i % COLORS.length]}
                    fillOpacity={1}
                    fill={`url(#color-${emp.empName})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
