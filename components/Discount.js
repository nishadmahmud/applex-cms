"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

export default function Discount({
  discountType,
  setDiscountType,
  discount,
  setDiscount,
  discountRef,
  handleDiscount,
}) {
  return (
    <div className="flex w-full">
      <Select
        value={discountType}
        onValueChange={(value) => {
          setDiscount(0);
          setDiscountType(value);
        }}
      >
        <SelectTrigger className="w-[60%] rounded-r-none h-9">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input
        ref={discountRef}
        className="w-[40%] rounded-l-none h-9 text-center"
        onKeyDown={handleDiscount}
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        placeholder="0"
      />
    </div>
  );
}
