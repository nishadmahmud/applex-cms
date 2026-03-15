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
  color,
  textColor,
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
      className={`bg-gradient-to-br ${color} rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-xl md:text-2xl font-bold ${textColor} mt-2`}>
            {formatValue(value)}
          </p>
          {currency && <p className="text-xs text-gray-500 mt-1">{currency}</p>}
        </div>
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      {trendNumeric !== null && (
        <div className="flex items-center mt-4">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          )}
          <span
            className={`text-sm font-semibold ml-1 ${isPositive ? "text-green-600" : "text-red-600"
              }`}
          >
            {Math.abs(trendNumeric).toFixed(0)}%
          </span>
          {trendText && (
            <span className="text-xs text-gray-500 ml-2">{trendText}</span>
          )}
        </div>
      )}
    </Link>
  );
}
