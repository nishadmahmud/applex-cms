"use client";
import { ArrowLeftRight } from "lucide-react";
import React from "react";

export default function ExchangeCartBadge() {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 px-2 py-[1px] rounded-full 
                 text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300"
    >
      <ArrowLeftRight className="w-3 h-3" />
      Exchange
    </span>
  );
}
