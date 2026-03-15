"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import Modal from "@/app/utils/Modal";

export default function ItemsValueModal({ open, onClose, items, onQtyChange }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Item Variations"
      content={
        <div className="space-y-4">
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border p-3 rounded-md"
            >
              <div className="flex gap-3 items-center">
                <img
                  src={item.images?.[0]}
                  alt={item.sku}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-semibold text-sm">{item.sku}</p>
                  <p className="text-xs text-gray-500">
                    {item.color?.join(", ")} – {item.storage?.join(", ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Price: ৳{item.purchase_price}
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => onQtyChange(item.id, "dec")}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity || 0}
                  className="w-[60px] text-center"
                  readOnly
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={() => onQtyChange(item.id, "inc")}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
