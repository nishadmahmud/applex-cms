"use client";

import React, { useState } from "react";
import Modal from "@/app/utils/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PosCalculatorModal({ open, onClose }) {
  const [value, setValue] = useState("");

  const handleClick = (key) => {
    if (key === "C") setValue("");
    else if (key === "=") {
      try {
        setValue(eval(value).toString());
      } catch {
        setValue("Error");
      }
    } else setValue(value + key);
  };

  const keys = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "C",
    "+",
  ];

  return (
    <Modal
      title="Calculator"
      open={open}
      onClose={onClose}
      content={
        <div className="space-y-4">
          <Input readOnly value={value} className="text-2xl text-center" />
          <div className="grid grid-cols-4 gap-2">
            {keys.map((k) => (
              <Button
                key={k}
                onClick={() => handleClick(k)}
                className="text-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                {k}
              </Button>
            ))}
            <Button
              onClick={() => handleClick("=")}
              className="col-span-4 bg-green-600 text-white hover:bg-green-700"
            >
              =
            </Button>
          </div>
        </div>
      }
    />
  );
}
