"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useFunds from "@/apiHooks/hooks/useFundsQuery";

export default function FundTransferForm({ accounts = [], refetchAccounts }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // We only need mutations here; prevent extra query with enabled: false
  const { transferFunds } = useFunds({ enabled: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to || !amount) {
      toast.warning("Please fill all fields");
      return;
    }
    if (from === to) {
      toast.warning("From and To accounts must differ");
      return;
    }

    try {
      const payload = {
        account_from: Number(from),
        account_to: Number(to),
        amount: Number(amount),
      };
      const res = await transferFunds.mutateAsync(payload);
      toast.success(res?.message || "Transfer Successful");

      setAmount("");
      setFrom("");
      setTo("");

      // Optimistic update already applied; this ensures server state sync
      await refetchAccounts?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.data?.message || "Transfer failed";
      toast.error(msg);
    }
  };

  const isLoading = transferFunds.isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Fund Transfer</h2>
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <Label>From</Label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            <option value="">Select...</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.payment_category_name} — {acc.account_number}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <Label>To</Label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            <option value="">Select...</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.payment_category_name} — {acc.account_number}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Processing..." : "Transfer"}
        </Button>
      </div>
    </form>
  );
}
