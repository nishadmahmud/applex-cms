"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import dayjs from "dayjs";
import { toast } from "sonner";

export default function TargetModal({
  open,
  onClose,
  editData,
  onSubmit,
  products,
  onSearch,
}) {
  const [form, setForm] = useState({
    product_id: "",
    target_month: dayjs().format("YYYY-MM"),
    target_quantity: "",
    target_amount: "",
    note: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        product_id: editData.product_info?.id ?? "",
        target_month: editData.target_month,
        target_quantity: editData.target_quantity,
        target_amount: editData.target_amount,
        note: editData.note ?? "",
      });
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.product_id) return toast.error("Please select product");
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Create"} Sales Target</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="text-sm font-medium">Product</label>
          <Select
            placeholder="Select product..."
            options={
              products?.map((p) => ({ label: p.name, value: p.id })) ?? []
            }
            onInputChange={onSearch}
            value={
              form.product_id
                ? {
                    label:
                      products?.find((p) => p.id === form.product_id)?.name ??
                      "Selected",
                    value: form.product_id,
                  }
                : null
            }
            onChange={(opt) =>
              setForm((p) => ({ ...p, product_id: opt.value }))
            }
            isSearchable
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Month</label>
              <Input
                type="month"
                name="target_month"
                value={form.target_month}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                name="target_quantity"
                value={form.target_quantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Target Amount</label>
            <Input
              type="number"
              name="target_amount"
              value={form.target_amount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <Input
              name="note"
              placeholder="Any note..."
              value={form.note}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editData ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
