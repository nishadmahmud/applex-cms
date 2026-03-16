"use client";
import React from "react";
export default function IntervalSelector({ value, onChange }) {
  const intervals = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-100">
      {intervals.map((interval) => (
        <button
          key={interval.value}
          onClick={() => onChange(interval.value)}
          className={`px-2.5 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-bold transition-all ${value === interval.value
              ? "bg-black text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
}
