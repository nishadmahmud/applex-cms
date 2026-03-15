"use client";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
  title,
  value,
  percentage,
  report,
  icon: Icon,
  color = "blue",
}) {
  const isPositive = percentage && !percentage.includes("-");
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const formatValue = (val) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(val);
    }
    return val;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </h3>
          {percentage && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                  isPositive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {percentage}
              </span>
              {report && (
                <span className="text-xs text-gray-500">{report}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
