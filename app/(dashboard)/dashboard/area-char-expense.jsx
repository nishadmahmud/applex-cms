"use client";
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AreaChartCard({ title, color, dataKey, data }) {
  const formatNum = (v) =>
    v >= 1e9
      ? `${(v / 1e9).toFixed(1)}B`
      : v >= 1e6
        ? `${(v / 1e6).toFixed(1)}M`
        : v >= 1e3
          ? `${(v / 1e3).toFixed(1)}K`
          : v;

  // Define a light gradient under the area curve for elegance
  const gradientId = `grad-${dataKey.replace(/\s+/g, "")}`;

  return (
    <Card className="shadow-sm h-72 md:h-96 transition-all hover:shadow-md bg-card border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-foreground tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
          >
            {/* gradient fill */}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis tickFormatter={formatNum} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
            <Tooltip
              formatter={(v) => v.toLocaleString()}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
              itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
