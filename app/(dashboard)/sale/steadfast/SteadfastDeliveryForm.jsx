"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api"; // or use the steadfastApi hooks if preferred

export default function SteadfastDeliveryForm({
  orderList,
  total,
  customerData,
  onSubmit,
}) {
  const [recipient, setRecipient] = useState({
    name: customerData?.delivery_customer_name || customerData?.name || "",
    phone:
      customerData?.delivery_customer_phone ||
      customerData?.mobile_number ||
      "",
    address:
      customerData?.delivery_customer_address || customerData?.address || "",
  });

  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!recipient.name || !recipient.phone || recipient.address.length < 10) {
      toast.error("Please provide valid receiver details.");
      return;
    }

    const formValues = {
      recipient_name: recipient.name,
      recipient_phone: recipient.phone,
      recipient_address: recipient.address,
      note,
    };

    await onSubmit(formValues);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Confirm delivery details for Steadfast courier.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Name
        </label>
        <Input
          value={recipient.name}
          onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Phone
        </label>
        <Input
          value={recipient.phone}
          onChange={(e) =>
            setRecipient({ ...recipient, phone: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Receiver Address
        </label>
        <Input
          value={recipient.address}
          onChange={(e) =>
            setRecipient({ ...recipient, address: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <Input
          placeholder="Any note (optional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
      >
        Save & Proceed
      </Button>
    </div>
  );
}
