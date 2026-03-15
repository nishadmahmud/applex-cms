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
  console.log(returnData);
  // update quantity
  const handleQtyChange = (id, val, max) => {
    setReturnData((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, return_qty: Math.min(max, Number(val || 0)) } : p
      )
    );
  };

  // update discount and recalc total for the row
  const handleDiscountChange = (id, field, val) => {
    setReturnData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [field]: val };

        // ensure safe numeric calculation
        const unitPrice = Number(
          updated.return_unit_price || updated.price || 0
        );
        const qty = Number(updated.return_qty || 0);
        const dtype = updated.discount_type || "Fixed";
        const dval = Number(updated.discount || 0);

        const gross = unitPrice * qty;
        const discountAmount =
          dtype === "Percentage" ? (gross * dval) / 100 : dval;
        updated.return_amount = Math.max(gross - discountAmount, 0);

        return updated;
      })
    );
  };

  return (
    <div className="space-y-5">
      {returnData.map((p) => {
        const unitPrice = Number(p.return_unit_price || p.price || 0);
        const qty = Number(p.return_qty || 1);
        const displayTotal = (unitPrice * qty).toFixed(2);

        return (
          <div
            key={p.id}
            className="p-5 border rounded-lg bg-gray-50 shadow-sm hover:shadow transition"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-gray-900">
                  {p.product_name ||
                    p.product_info?.name ||
                    `Product #${p.product_id}`}
                </div>

                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                  <span>ID #{p.product_id}</span>
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
                <span className="text-[11px] bg-emerald-50 text-emerald-600 font-medium px-2 py-[2px] rounded-full">
                  Variant Product
                </span>
              )}
            </div>

            {/* Quantity Section */}
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Purchase Qty
                </label>
                <Input
                  value={p.purchase_qty || qty}
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
                  max={p.purchase_qty || qty}
                  value={p.return_qty}
                  onChange={(e) =>
                    handleQtyChange(p.id, e.target.value, p.purchase_qty || qty)
                  }
                />
              </div>
            </div>

            {/* Discount Section */}
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium mb-1 block">
                  Discount Type
                </label>
                <Select
                  value={p.discount_type || "Fixed"}
                  onValueChange={(v) =>
                    handleDiscountChange(p.id, "discount_type", v)
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
            <div className="flex justify-between items-center text-sm font-semibold text-gray-800 mt-1">
              <span>Total Before Discount:</span>
              <span>{displayTotal} BDT</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-emerald-700 mt-1">
              <span>Total After Discount:</span>
              <span>{(p.return_amount || 0).toFixed(2)} BDT</span>
            </div>
          </div>
        );
      })}

      {/* Return to Stock */}
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox id="return-stock" defaultChecked />
        <label htmlFor="return-stock" className="text-sm font-medium">
          Return to Stock
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
