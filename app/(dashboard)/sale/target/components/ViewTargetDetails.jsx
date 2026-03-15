"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import dayjs from "dayjs";

/** helper to render human‑readable month */
const monthLabel = (iso) =>
  iso ? dayjs(`${iso}-01`).format("MMMM YYYY") : "—";

/** helper for circular percentage indicator */
function CircleProgress({ value = 0, label }) {
  const safeVal = Math.min(value, 999);
  const color = value < 50 ? "#f97316" : value < 90 ? "#facc15" : "#10b981"; // orange/yellow/green
  const radius = 20;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, 100) / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg
          className="rotate-[-90deg]"
          width="46"
          height="46"
          aria-hidden="true"
        >
          <circle
            cx="23"
            cy="23"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx="23"
            cy="23"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[11px] font-semibold text-gray-700">
          {safeVal}%
        </span>
      </div>
      {label && (
        <p className="mt-1 text-xs text-gray-600 font-medium leading-none">
          {label}
        </p>
      )}
    </div>
  );
}

export default function ViewTargetDetails({ open, onClose, item }) {
  if (!item) return null;
  const p = item.product_info || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex justify-between">
            Product Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* --- Product header --- */}
          <div className="flex items-center gap-4">
            {p.image_path ? (
              <img
                src={p.image_path}
                alt={p.name}
                className="w-24 h-24 rounded-md border object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
                No Image
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{p.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                Barcode : {p.barcode || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                Target Month : {monthLabel(item.target_month)}
              </p>
            </div>
          </div>

          <Separator />

          {/* --- Details grid --- */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-800">Target Qty:</span>{" "}
              {item.target_quantity}
            </div>
            <div>
              <span className="font-medium text-gray-800">Achieved Qty:</span>{" "}
              {item.achieved_quantity}
            </div>

            <div>
              <span className="font-medium text-gray-800">Target mount:</span> ৳{" "}
              {item.target_amount?.toLocaleString() ?? 0}
            </div>
            <div>
              <span className="font-medium text-gray-800">Achieved mount:</span>{" "}
              ৳
              {item.achieved_amount?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }) ?? 0}
            </div>

            <div className="col-span-2">
              <span className="font-medium text-gray-800">Note:</span>{" "}
              {item.note || "—"}
            </div>
          </div>

          <Separator className="my-2" />

          {/* --- Performance section --- */}
          <div className="pt-2">
            <p className="text-sm font-medium mb-3">Performance Summary</p>

            <div className="flex items-center justify-evenly gap-6">
              <CircleProgress
                value={item.achieved_quantity_percentage}
                label="Qty ach %"
              />
              <CircleProgress
                value={item.achieved_amount_percentage}
                label="Amt ach %"
              />
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Qty nd mount chievement percentages based on targets
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
