"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StepReturnQty({
  returnData,
  setReturnData,
  onBack,
  onNext,
}) {
  // --- when quantity changes, also update total ---
  const handleQtyChange = (id, val, max) => {
    const qty = Math.min(max, Number(val || 0));
    setReturnData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const unit = Number(p.return_unit_price || p.price || 0);
        const discType = p.discount_type || "Fixed";
        const discValue = Number(p.discount || 0);
        const gross = unit * qty;
        const discount =
          discType === "Percentage" ? (gross * discValue) / 100 : discValue;
        return {
          ...p,
          return_qty: qty,
          return_amount: Math.max(gross - discount, 0),
        };
      })
    );
  };

  // --- when discount fields change, recalc total ---
  const handleDiscountChange = (id, field, val) => {
    setReturnData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: val };
        const unit = Number(updated.return_unit_price || updated.price || 0);
        const qty = Number(updated.return_qty || 0);
        const discType = updated.discount_type || "Fixed";
        const discValue = Number(updated.discount || 0);
        const gross = unit * qty;
        const discount =
          discType === "Percentage" ? (gross * discValue) / 100 : discValue;
        updated.return_amount = Math.max(gross - discount, 0);
        return updated;
      })
    );
  };

  return (
    <div className="space-y-5">
      {returnData.map((p) => {
        const unitPrice = Number(p.return_unit_price || p.price || 0);
        const qty = Number(p.return_qty || 0);
        const total = (unitPrice * qty).toFixed(2);

        return (
          <div
            key={p.id}
            className="p-5 border rounded-lg bg-gray-50 shadow-sm relative"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-gray-900">
                  {p.product_name || `Product ID #${p.product_id}`}
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                  <span>#{p.product_id}</span>
                  {p.imei && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span>
                        IMEI
                        <span className="font-medium text-gray-700">
                          {p.imei}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              {p.is_variant && (
                <span className="text-[11px] bg-indigo-50 text-indigo-600 font-medium px-2 py-[2px] rounded-full">
                  Variant Product
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Sale Qty
                </label>
                <Input
                  value={p.purchase_qty}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Return Qty
                </label>
                <Input
                  type="number"
                  min={1}
                  max={p.return_qty}
                  value={p.return_qty}
                  onChange={(e) =>
                    handleQtyChange(p.id, e.target.value, p.purchase_qty)
                  }
                />
              </div>
            </div>

            {/* Discount section */}
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Discount Type
                </label>
                <Select
                  value={p.discount_type}
                  onValueChange={(val) =>
                    handleDiscountChange(p.id, "discount_type", val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed (BDT)</SelectItem>
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Discount Value
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={p.discount}
                  onChange={(e) =>
                    handleDiscountChange(p.id, "discount", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Totals */}
            <div className="grid md:grid-cols-2 gap-3 mt-3 border-t pt-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Unit Price (BDT)
                </label>
                <Input value={unitPrice.toFixed(2)} readOnly />
              </div>
              <div className="flex flex-col justify-end items-end">
                <span className="text-xs font-medium text-gray-500">
                  Total Return Amount:
                </span>
                <span className="text-base font-semibold text-indigo-700">
                  {p.return_amount ? p.return_amount.toFixed(2) : total} BDT
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Footer actions */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox id="return-stock" defaultChecked />
        <label htmlFor="return-stock" className="text-sm font-medium">
          Return to Stock
        </label>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Next
        </Button>
      </div>
    </div>
  );
}
