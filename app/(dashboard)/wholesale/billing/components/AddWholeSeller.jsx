"use client";
import React, { useState } from "react";
import { useSaveWholeSellerMutation } from "@/app/store/api/wholeSellerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AddWholeSeller({ setModalOpen, setSchema }) {
  const [saveWholeSeller, { isLoading }] = useSaveWholeSellerMutation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_number: "",
    address: "",
  });

  const handleChange = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧩 --- Validation ---
    const { name, email, mobile_number } = form;

    if (!name.trim()) {
      toast.error("Wholeseller name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email address is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!mobile_number.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!/^\+?\d{6,15}$/.test(mobile_number.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // ----------------------

    try {
      const res = await saveWholeSeller(form).unwrap();
      if (res.success) {
        toast.success("Whole seller added");
        setSchema({
          wholeseller_id: res.data.id,
          wholeseller_name: res.data.name,
        });
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add whole seller");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <Input
        placeholder="Email"
        value={form.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <Input
        placeholder="Phone"
        value={form.mobile_number}
        onChange={(e) => handleChange("mobile_number", e.target.value)}
      />
      <Input
        placeholder="Address"
        value={form.address}
        onChange={(e) => handleChange("address", e.target.value)}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
