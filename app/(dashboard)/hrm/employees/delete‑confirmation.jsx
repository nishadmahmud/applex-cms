"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export default function DeleteConfirmation({
  open,
  onConfirm,
  onCancel,
  name,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-lg border border-gray-100 p-5 space-y-5 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Delete Confirmation
          </h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-medium text-red-600">{name}</span>?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
