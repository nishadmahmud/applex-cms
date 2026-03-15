import React from "react";
const STATUS_COLORS = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-emerald-100 text-emerald-700",
  5: "bg-red-100 text-red-700",
  6: "bg-gray-200 text-gray-700",
};

const STATUS_LABELS = {
  1: "Order Received",
  2: "Order Completed",
  3: "Delivery Processing",
  4: "Delivered",
  5: "Canceled",
  6: "Hold",
};

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[status] || "Unknown";
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
