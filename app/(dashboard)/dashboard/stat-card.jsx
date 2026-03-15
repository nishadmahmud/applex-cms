import React from "react";
import Link from "next/link";

export default function StatCard({
  title,
  value,
  currency,
  icon,
  gradientClass,
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
      className={`relative overflow-hidden rounded-md shadow-sm hover:shadow-md transition-all group block ${gradientClass || 'bg-[#0073B7]'}`}
    >
      <div className="p-4 pt-6 md:p-5 md:pt-7 relative z-0 flex flex-col h-full justify-between min-h-[110px]">
        {/* Top Row: Icon & Value */}
        <div className="flex items-center justify-between mb-2 pl-2">
          <div className="text-white/80 text-4xl drop-shadow-sm group-hover:scale-110 group-hover:text-white transition-all">
            {icon}
          </div>
          <div className="text-right">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {formatValue(value)}
            </h3>
          </div>
        </div>
        
        {/* Bottom Row: Title */}
        <div className="text-right mt-1">
          <p className="text-[12px] md:text-sm font-bold text-white/90 uppercase tracking-widest">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}
