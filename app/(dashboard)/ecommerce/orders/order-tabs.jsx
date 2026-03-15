import React from "react";
export default function OrderTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto mb-6 scrollbar-hide">
      {tabs.map((t) => (
        <button
          key={t.type}
          onClick={() => onTabChange(t.type)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors
          ${
            activeTab === t.type
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
