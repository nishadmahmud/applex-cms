"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useFunds from "@/apiHooks/hooks/useFundsQuery";

export default function AddBalanceForm({ accounts = [], refetchAccounts }) {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");

  // Only need mutation; avoid extra query
  const { addBalance } = useFunds({ enabled: false });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!accountId || !amount || !name) {
      toast.warning("All fields are required");
      return;
    }
    try {
      const selected = accounts?.find(
        (a) => Number(a.id) === Number(accountId)
      );
      const payload = {
        account_id: Number(accountId),
        payment_type_id: Number(selected?.payment_type_id || 1),
        amount: Number(amount),
        name,
      };
      const res = await addBalance.mutateAsync(payload);
      toast.success(res?.message || "Balance Added");

      setAmount("");
      setName("");
      setAccountId("");

      // Optimistic update already applied; this ensures server state sync
      await refetchAccounts?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        "Balance addition failed";
      toast.error(msg);
    }
  };

  const isLoading = addBalance.isLoading;

  return (
    <form onSubmit={handleAdd} className="space-y-4 border-t pt-6 mt-4">
      <h2 className="text-lg font-semibold text-gray-700">Add Balance</h2>
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Reference name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
        <div className="flex-1">
          <Label>Select Account</Label>
          <select
            className="w-full border rounded-md p-2 text-sm"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            <option value="">Select...</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.payment_category_name} — {acc.account_number}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? "Adding..." : "Add Balance"}
        </Button>
      </div>
    </form>
  );
}
