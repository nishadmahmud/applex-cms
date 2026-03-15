import {
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Blend } from "lucide-react";
import React from "react";

export default function Modal({
  title,
  content,
  open,
  onClose,
  Icon = Blend,
  customDesignFor,
}) {
  const isVariationModal = customDesignFor === "variation_modal";
  const isEmployeeModal = customDesignFor === "employee_modal";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`pointer-events-auto ${
          isVariationModal
            ? "w-[90vw] max-w-none max-h-[90vh] overflow-y-auto"
            : isEmployeeModal
            ? "max-w-7xl max-h-[90vh] overflow-y-auto"
            : "max-w-2xl max-h-[80vh] overflow-y-auto"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon className="text-blue-500 bg-blue-50 p-1 rounded-lg h-8 w-8" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  );
}
