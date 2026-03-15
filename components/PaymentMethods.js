"use client";
import { useGetPaymentListQuery } from "@/app/store/api/paymentApi";
import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export default function PaymentMethods({
  setPaymentName,
  payAmount,
  setPayAmount,
  selectedAccount,
  setSelectedAccount,
  paymentMethods,
  setPaymentMethods,
  selectedGateway,
  setSelectedGateway,
  type = null,
  onOrderComplete,
  ref = null,
  onClose,
  // total = { total },
  total,
  // setTotalPaidAmount = { setTotalPaidAmount },
  setTotalPaidAmount,
}) {
  const { data: paymentGateways } = useGetPaymentListQuery(undefined);
  const [selectedMethod, setSelectedMethod] = useState("");

  const addPaymentMethod = () => {
    const newMethod = {
      id: Date.now().toString(),
      methodName: "",
      payment_amount: "",
      payment_type_category_id: "",
      payment_type_id: "",
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const removePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const updatePaymentMethod = (id, field, value) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id ? { ...method, [field]: value } : method,
      ),
    );
  };

  useEffect(() => {
    if (selectedMethod) {
      const selected = paymentGateways.data.data.find(
        (item) => item.id == selectedMethod,
      );
      setSelectedGateway(selected);
    }
  }, [selectedMethod]);

  useEffect(() => {
    const accounts = selectedGateway?.payment_type_category;
    if (accounts?.length >= 1) {
      setSelectedAccount(accounts[0].id);
    }
  }, [selectedGateway]);

  useEffect(() => {
    if (paymentGateways?.data?.data && paymentGateways?.data?.data?.length) {
      const defaultAcc =
        paymentGateways.data.data.find((item) => item.type_name === "Cash") ||
        null;
      if (defaultAcc) {
        setSelectedMethod(defaultAcc.id);
      }
    }
  }, [paymentGateways]);

  // 🟩 Initialize main amount with total payable when modal opens
  useEffect(() => {
    if (Number(payAmount) === 0 && Number(total) > 0) {
      setPayAmount(Number(total));
    }
  }, [total]);

  const handleOrderComplete = (e) => {
    if (e.key === "Enter") {
      onOrderComplete();
    }
  };

  return (
    <div ref={ref} className="space-y-4">
      {/* === Main / Primary Payment === */}
      <div className="border border-gray-200 p-3 rounded-md bg-white shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-2">Primary Payment</h4>

        {/* Method select (default: Cash) */}
        <Label>Method</Label>
        <select
          value={selectedMethod}
          onChange={(e) => {
            const newId = e.target.value;
            setSelectedMethod(newId);
            const selected = paymentGateways?.data?.data?.find(
              (item) => item.id == newId,
            );
            if (selected) {
              setSelectedGateway(selected);
              setPaymentName(selected.type_name);
              const firstAcc = selected.payment_type_category?.[0];
              setSelectedAccount(firstAcc?.id);
            }
          }}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="">Select Method</option>
          {paymentGateways?.data?.data?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.type_name}
            </option>
          ))}
        </select>

        {/* Account list (non-cash only) */}
        {selectedGateway?.type_name !== "Cash" && (
          <>
            <Label className="mt-2">Account Name</Label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            >
              {selectedGateway?.payment_type_category?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.payment_category_name}
                </option>
              ))}
            </select>

            <Label className="mt-2">Account Number</Label>
            <Input
              disabled
              value={
                selectedGateway?.payment_type_category?.find(
                  (acc) => acc.id == selectedAccount,
                )?.account_number ?? ""
              }
            />
          </>
        )}

        {/* Amount */}
        <Label className="mt-2">Amount</Label>
        <Input
          type="number"
          value={isNaN(payAmount) ? "" : payAmount}
          onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* === Extra Methods === */}
      {paymentMethods.map((method, index) => (
        <div
          key={method.id || index}
          className="border-t pt-3 space-y-1 border-gray-300"
        >
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-gray-700">Extra Method</Label>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removePaymentMethod(method.id)}
            >
              Remove
            </Button>
          </div>

          <select
            value={method.methodName}
            onChange={(e) => {
              const methodName = e.target.value;
              const gateway = paymentGateways?.data?.data?.find(
                (g) => g.type_name === methodName,
              );
              updatePaymentMethod(method.id, "methodName", methodName);
              if (gateway) {
                updatePaymentMethod(method.id, "payment_type_id", gateway.id);
                const first = gateway.payment_type_category?.[0];
                updatePaymentMethod(
                  method.id,
                  "payment_type_category_id",
                  first?.id,
                );
              }
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            {paymentGateways?.data?.data?.map((m) => (
              <option key={m.id} value={m.type_name}>
                {m.type_name}
              </option>
            ))}
          </select>

          {/* Account list if non-cash */}
          {method.methodName !== "Cash" &&
            paymentGateways?.data?.data?.find(
              (g) => g.type_name === method.methodName,
            )?.payment_type_category?.length > 0 && (
              <>
                <Label>Account</Label>
                <select
                  value={method.payment_type_category_id}
                  onChange={(e) =>
                    updatePaymentMethod(
                      method.id,
                      "payment_type_category_id",
                      e.target.value,
                    )
                  }
                  className="w-full p-2 border rounded"
                >
                  {paymentGateways.data.data
                    .find((g) => g.type_name === method.methodName)
                    ?.payment_type_category.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.payment_category_name}
                      </option>
                    ))}
                </select>
              </>
            )}

          <Label>Amount</Label>
          <Input
            type="number"
            value={isNaN(method.payment_amount) ? "" : method.payment_amount}
            onChange={(e) =>
              updatePaymentMethod(
                method.id,
                "payment_amount",
                parseFloat(e.target.value) || 0,
              )
            }
          />
        </div>
      ))}

      {/* Add another */}
      <div>
        <Button variant="outline" onClick={addPaymentMethod}>
          + Add Another Method
        </Button>
      </div>

      {/* === Totals row === */}
      {total ? (
        <div className="border-t pt-3 text-sm text-gray-800 space-y-1">
          {(() => {
            const extrasTotal = paymentMethods.reduce(
              (s, m) => s + (Number(m.payment_amount) || 0),
              0,
            );
            const totalPaid = Number(payAmount || 0) + extrasTotal;
            // 🧮 Improved due/change calculation
            const rawDiff = totalPaid - total;
            const due = rawDiff < 0 ? Math.abs(rawDiff) : 0;
            const change = rawDiff > 0 ? rawDiff : 0;
            return (
              <div
                className="flex items-center justify-between gap-3 
                bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50
                border border-violet-100 rounded-md px-3 py-2 shadow-sm 
                font-medium text-gray-800 text-sm"
              >
                <div className="flex flex-col items-center justify-center flex-1 text-center leading-tight">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">
                    Total Payable
                  </span>
                  <span className="font-semibold text-violet-700 text-[15px]">
                    {Number(total).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 text-center border-x border-violet-100 leading-tight">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">
                    Total Paid
                  </span>
                  <span className="font-semibold text-blue-700 text-[15px]">
                    {totalPaid.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 text-center leading-tight">
                  <span
                    className={`text-[11px] uppercase tracking-wide ${
                      totalPaid < total ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {totalPaid < total ? "Due" : "Change"}
                  </span>
                  <span
                    className={`font-semibold text-[15px] ${
                      totalPaid < total ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {(totalPaid < total ? due : change).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {/* Save button */}
      {type && (
        <Button
          className="w-full bg-indigo-600 text-white mt-3"
          onClick={() => {
            // Calculate total of all methods
            const extrasTotal = paymentMethods.reduce(
              (sum, m) => sum + (Number(m.payment_amount) || 0),
              0,
            );
            const totalPaid = Number(payAmount || 0) + extrasTotal;

            // 1️⃣ Leave payAmount as "Cash amount" only
            //     (so 250 stays as Cash)
            setPayAmount(Number(payAmount) || 0);

            // 2️⃣ Report aggregate total to parent
            if (setTotalPaidAmount) setTotalPaidAmount(totalPaid);

            // 3️⃣ Update Pay Mode name for UI display
            const methodNames = [
              selectedGateway?.type_name || "Cash",
              ...paymentMethods.map((m) => m.methodName).filter(Boolean),
            ];
            setPaymentName([...new Set(methodNames)].join(" + "));

            // 4️⃣ Small delay to close safely
            setTimeout(() => {
              if (typeof onClose === "function") onClose();
            }, 150);
          }}
        >
          Save
        </Button>
      )}
    </div>
  );
}
