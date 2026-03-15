"use client";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";

export default function BestSellingStats() {
  return (
    <div className="h-full">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
        <CardContent className="p-6">
          <p className="text-lg font-semibold">Best selling products</p>
          <p className="text-sm">Overview 2025</p>
          <div>
            <Image
              src={"/piggy.png"}
              alt="best-selling-bg"
              width={300}
              height={150}
              className="h-36"
            />
          </div>
          <div className="space-y-3 h-full bg-white text-[#2A3547] p-5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">MaterialPro</p>
                <p className="text-sm opacity-75">$23,568</p>
              </div>
              <span className="text-xs bg-[#ECF2FF] px-3 py-1 font-medium text-blue-500 rounded-md">
                55%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 relative">
              <div
                className="bg-blue-500 h-1 z-10 rounded-full relative"
                style={{ width: "55%" }}
              ></div>
              <div className="absolute w-full bg-[#EAEFF4] h-1 top-0 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Flexy Admin</p>
                <p className="text-sm opacity-75">$23,568</p>
              </div>
              <span className="text-xs bg-[#ECF2FF] px-3 py-1 font-medium text-blue-500 rounded-md">
                20%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 relative">
              <div
                className="bg-blue-500 h-1 z-10 rounded-full relative"
                style={{ width: "20%" }}
              ></div>
              <div className="absolute w-full bg-[#EAEFF4] h-1 top-0 rounded-e-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
