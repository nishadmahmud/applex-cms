"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 *  A shared payment–method sub‑form used in both Sales Return and Purchase Return.
 *  Displays Method → Account → Account Number → Amount.
 */
export default function PaymentMethodItem({
  index,
  payment,
  methods,
  onChange,
  onRemove,
}) {
  const method = methods?.find((m) => m.id === payment.payment_type_id);

  // auto‑select first account for chosen method
  useEffect(() => {
    if (method && !payment.payment_type_category_id) {
      const firstAccount = method.payment_type_category?.[0];
      if (firstAccount) {
        onChange(index, { payment_type_category_id: firstAccount.id });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  return (
    <div className="border border-emerald-100 p-4 rounded-xl bg-white shadow-sm space-y-3 transition-all hover:shadow-md">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">
          {method?.type_name || `Payment ${index + 1}`}
        </h4>
        {index > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
            className="bg-red-500 hover:bg-red-600"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Payment Method */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Method
          </label>
          <Select
            value={payment.payment_type_id?.toString() || ""}
            onValueChange={(val) =>
              onChange(index, {
                payment_type_id: Number(val),
                payment_type_category_id: null,
              })
            }
          >
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              {methods?.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.type_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Account
          </label>
          <Select
            disabled={!method}
            value={payment.payment_type_category_id?.toString() || ""}
            onValueChange={(val) =>
              onChange(index, {
                payment_type_category_id: Number(val),
              })
            }
          >
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {method?.payment_type_category?.map((a) => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.payment_category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Account number */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          Account Number
        </label>
        <Input
          disabled
          readOnly
          value={
            method?.payment_type_category?.find(
              (c) => c.id === payment.payment_type_category_id
            )?.account_number || ""
          }
          className="bg-gray-100"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">
          Amount (BDT)
        </label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={payment.Amount}
          onChange={(e) => onChange(index, { Amount: Number(e.target.value) })}
          className="focus:border-emerald-500"
        />
      </div>
    </div>
  );
}
