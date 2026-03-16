import React from "react";
import Link from "next/link";

export default function StatCard({
  title,
  value,
  currency,
  icon,
  accentColor, // e.g., "#0073B7"
  link,
}) {
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
      className="group block relative overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full"
      style={{ borderLeft: `4px solid ${accentColor || '#0073B7'}` }}
    >
      <div className="p-4 md:p-6 flex flex-col h-full justify-between min-h-[120px]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {title}
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tighter">
              {formatValue(value)}
            </h3>
          </div>
          
          <div 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ 
              backgroundColor: `${accentColor || '#0073B7'}10`, // 10% opacity hex
              color: accentColor || '#0073B7' 
            }}
          >
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
          </div>
        </div>

        {/* Optional divider or data area */}
        <div className="mt-4 flex items-center text-[11px] font-medium text-gray-400">
          <span className="group-hover:text-gray-600 transition-colors uppercase">View Details</span>
        </div>
      </div>
    </Link>
  );
}
