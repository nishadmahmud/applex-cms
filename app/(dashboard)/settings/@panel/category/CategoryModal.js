"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React from "react";

// eslint-disable-next-line react/prop-types
export default function CategoryModal({ content, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-96 overflow-y-auto">
        <DialogHeader>
            <DialogTitle>
                Create Category
            </DialogTitle>
            <DialogDescription>
                Fill all fields correctly
            </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
