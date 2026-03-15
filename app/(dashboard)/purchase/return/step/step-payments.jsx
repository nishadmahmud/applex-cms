"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import PaymentMethodItem from "../payment-method-item";

export default function StepPayments({
  payments,
  setPayments,
  paymentsData,
  saving,
  calcTotal,
  onBack,
  onDone,
}) {
  const totalAmount = calcTotal();

  // default to Cash
  useEffect(() => {
    if (payments.length === 1 && payments[0].payment_type_id === null) {
      const cash = paymentsData?.find(
        (m) => m.type_name?.toLowerCase() === "cash"
      );
      if (cash) {
        const firstCat = cash.payment_type_category?.[0];
        setPayments([
          {
            payment_type_id: cash.id,
            payment_type_category_id: firstCat?.id || null,
            Amount: totalAmount,
          },
        ]);
      } else {
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

  const addPayment = () => {
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

  const updatePayment = (i, vals) =>
    setPayments((p) => p.map((x, idx) => (idx === i ? { ...x, ...vals } : x)));

  const removePayment = (i) =>
    setPayments((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Purchase Return Amount</h4>
        <span className="font-semibold text-emerald-700">
          {totalAmount.toFixed(2)} BDT
        </span>
      </div>

      {payments.map((p, i) => (
        <PaymentMethodItem
          key={i}
          index={i}
          payment={p}
          methods={paymentsData}
          onChange={updatePayment}
          onRemove={removePayment}
        />
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addPayment}
        className="border-dashed w-full"
      >
        + Add Payment Method
      </Button>

      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onDone}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? "Saving..." : "Done"}
        </Button>
      </div>
    </div>
  );
}
