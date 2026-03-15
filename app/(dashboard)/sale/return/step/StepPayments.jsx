"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PaymentMethodItem from "../PaymentMethodItem";

export default function StepPayments({
  payments,
  setPayments,
  paymentsData, // full list from API
  saving,
  calcTotal,
  onBack,
  onDone,
}) {
  const totalAmount = calcTotal();

  // --------- Set default Cash method when arriving here -------------
  useEffect(() => {
    if (payments?.length === 1 && payments[0].payment_type_id === null) {
      const cashMethod = paymentsData?.find(
        (m) => m.type_name?.toLowerCase() === "cash"
      );
      if (cashMethod) {
        const firstAccount = cashMethod.payment_type_category?.[0];
        setPayments([
          {
            payment_type_id: cashMethod.id,
            payment_type_category_id: firstAccount?.id || null,
            Amount: totalAmount,
          },
        ]);
      } else {
        // fallback if Cash not found
        setPayments([
          {
            payment_type_id: null,
            payment_type_category_id: null,
            Amount: totalAmount,
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentsData]);

  // ---------- Add another payment ----------
  const addPayment = () => {
    // calculate remaining = total - current sum
    const used = payments.reduce((sum, p) => sum + Number(p.Amount || 0), 0);
    const remaining = Math.max(totalAmount - used, 0);

    setPayments((prev) => [
      ...prev,
      {
        payment_type_id: null,
        payment_type_category_id: null,
        Amount: remaining,
      },
    ]);
  };

  const changePayment = (i, vals) => {
    setPayments((p) => p.map((x, idx) => (i === idx ? { ...x, ...vals } : x)));
  };
  const removePayment = (i) =>
    setPayments((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Return Amount</h4>
        <span className="font-medium text-blue-700">{totalAmount} BDT</span>
      </div>

      {payments.map((p, i) => (
        <PaymentMethodItem
          key={i}
          index={i}
          payment={p}
          methods={paymentsData}
          onChange={changePayment}
          onRemove={removePayment}
        />
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addPayment}
        className="border-dashed w-full"
      >
        + Add Payment Method
      </Button>

      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onDone} disabled={saving}>
          {saving ? "Saving..." : "Done"}
        </Button>
      </div>
    </div>
  );
}
