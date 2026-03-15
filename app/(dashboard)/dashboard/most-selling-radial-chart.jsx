"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

export default function MostSellingRadialChart({ salesTarget }) {
  if (!salesTarget) return null;

  const {
    total_target_amount,
    total_achieved_amount,
    total_target_qty,
    total_achieved_qty,
    amount_success_percentage,
    amount_remaining_percentage,
    qty_success_percentage,
    qty_remaining_percentage,
  } = salesTarget;

  // Data for donut chart
  const chartData = [
    {
      name: "Achieved",
      value: parseFloat(qty_success_percentage) || 0,
      fill: "#10b981", // green
    },
    {
      name: "Remaining",
      value: parseFloat(qty_remaining_percentage) || 0,
      fill: "#ef4444", // red
    },
  ];

  // Custom label component for legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-4 md:gap-8 mt-2">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-sm h-80 md:h-96 bg-card border-border transition-all hover:shadow-md overflow-hidden rounded-md">
      <CardHeader className="bg-[#0073B7] p-3 flex flex-row items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-white" />
        <CardTitle className="text-sm font-bold text-white tracking-wider uppercase m-0 p-0">Sales Target Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-white/50 pt-4">
        <div className="h-[240px] md:h-[300px] flex flex-col">
          {/* Donut Chart */}
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="95%"
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox;
                      const remainingPercent = parseFloat(qty_remaining_percentage) || 0;
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy - 10}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest"
                          >
                            Remaining
                          </text>
                          <text
                            x={cx}
                            y={cy + 15}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-rose-600 text-3xl font-black tracking-tighter"
                          >
                            {remainingPercent.toFixed(1)}%
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats below chart */}
          <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t border-border/50 mt-2">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Qty</p>
              <p className="text-sm font-black text-foreground">
                {total_target_qty?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Achieved Qty</p>
              <p className="text-sm font-black text-emerald-600">
                {total_achieved_qty?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
