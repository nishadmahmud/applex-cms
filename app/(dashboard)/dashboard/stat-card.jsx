import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default function StatCard({
  title,
  value,
  currency,
  trend,
  trendText,
  icon,
  accentColor,
  link,
}) {
  // Handle both numeric and string percentage values
  const parseTrend = (trendValue) => {
    if (!trendValue) return null;
    if (typeof trendValue === "string") {
      return Number.parseFloat(trendValue.replace("%", ""));
    }
    return trendValue;
  };

  const trendNumeric = parseTrend(trend);
  const isPositive = trendNumeric !== null && trendNumeric >= 0;

  const formatValue = (val) => {
    if (typeof val === "number") {
      return val.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return val;
  };

  return (
    <Link
      href={link || "#"}
      className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <p className={`text-2xl md:text-3xl font-bold text-foreground group-hover:${accentColor} transition-colors`}>
              {formatValue(value)}
            </p>
            {currency && <span className="text-xs font-bold text-muted-foreground/60">{currency}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl md:text-3xl border border-border transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      {trendNumeric !== null && (
        <div className="flex items-center mt-6 pt-4 border-t border-border/50">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trendNumeric).toFixed(0)}%
          </div>
          {trendText && (
            <span className="text-[11px] font-medium text-muted-foreground/80 ml-3">{trendText}</span>
          )}
        </div>
      )}
    </Link>
  );
}
