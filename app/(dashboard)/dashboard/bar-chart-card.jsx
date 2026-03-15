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
    <Card className="shadow-sm h-72 md:h-96 transition-all hover:shadow-md bg-card border-border overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
