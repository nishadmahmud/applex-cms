"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function BarChartCard({ title, color, dataKey, data }) {
  const formatNum = (v) =>
    v >= 1e9
      ? `${(v / 1e9).toFixed(1)}B`
      : v >= 1e6
        ? `${(v / 1e6).toFixed(1)}M`
        : v >= 1e3
          ? `${(v / 1e3).toFixed(1)}K`
          : v;

  return (
    <Card className="shadow-sm h-72 md:h-96 transition-all hover:shadow-md bg-card border-border overflow-hidden rounded-md">
      <CardHeader className="p-4 py-3 flex flex-row items-center gap-3 shrink-0 border-b border-gray-100 bg-white">
        <div className="w-8 h-8 rounded-md bg-[#0073B7]/10 flex items-center justify-center text-[#0073B7]">
          <BarChart3 className="w-4 h-4" />
        </div>
        <CardTitle className="text-[13px] font-bold text-gray-900 tracking-wider uppercase m-0 p-0">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={formatNum} axisLine={{ stroke: "hsl(var(--border))" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
              formatter={(v) => v.toLocaleString()} 
            />
            <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
