"use client";
import { FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "1000"], // optional
});

export default function PricingSection({
  getValues,
  form,
  watch,
  setValue,
  register,
}) {
  // Determine selected discount type for conditional rendering and styling
  const currentDiscountType = watch("discount_type");

  return (
    // UPDATED: Use larger padding and a cleaner shadow for the container
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 ${nunito.className}`}
    >
      <h3 className="text-base font-bold text-gray-900 mb-3">Pricing</h3>
      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
        {/* Purchase Price */}
        <div className="relative">
          <Label
            htmlFor="purchasePrice"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Purchase Price <span className="text-red-500">*</span>
          </Label>
          <FormField
            name="purchase_price"
            control={form.control}
            rules={{
              pattern: {
                value: /^[0-9]*\.?[0-9]*$/,
                message: "Only numbers are allowed",
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <>
                <FormControl>
                  <Input
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const parsed = value === "" ? "" : Number(value);
                      field.onChange(isNaN(parsed) ? "" : parsed);
                    }}
                    id="purchasePrice"
                    placeholder="0.00"
                    type="text"
                    className="rounded-lg border-gray-300 mt-1"
                  />
                </FormControl>
                {error && (
                  <p className="text-xs text-red-600 mt-1">{error.message}</p>
                )}
              </>
            )}
          />
        </div>

        {/* Wholesale Price */}
        <div className="relative">
          <Label
            htmlFor="wholesalePrice"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Wholesale Price
          </Label>
          <FormField
            name="wholesale_price"
            control={form.control}
            rules={{
              pattern: {
                value: /^[0-9]*\.?[0-9]*$/,
                message: "Only numbers are allowed",
              },
            }}
            render={({ field }) => (
              <FormControl>
                <Input
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : field.value
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsed = value === "" ? "" : Number(value);
                    field.onChange(isNaN(parsed) ? "" : parsed);
                  }}
                  id="wholesale_price"
                  placeholder="0.00"
                  type="text"
                  className="rounded-lg border-gray-300 mt-1"
                />
              </FormControl>
            )}
          />
        </div>

        {/* Retail Price */}
        <div className="relative">
          <Label
            htmlFor="retailPrice"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Retail Price <span className="text-red-500">*</span>
          </Label>
          <FormField
            name="retails_price"
            control={form.control}
            rules={{
              pattern: {
                value: /^[0-9]*\.?[0-9]*$/,
                message: "Only numbers are allowed",
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <>
                <FormControl>
                  <Input
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value
                    }
                    onChange={(e) => {
                      const input = e.target.value;
                      const parsed = input === "" ? "" : Number(input);
                      const cleaned = isNaN(parsed) ? "" : parsed;
                      field.onChange(cleaned);
                      setValue("regular_price", cleaned);
                    }}
                    id="retails_price"
                    placeholder="0.00"
                    type="text"
                    className="rounded-lg border-gray-300 mt-1"
                  />
                </FormControl>
                {error && (
                  <p className="text-xs text-red-600 mt-1">{error.message}</p>
                )}
                {!error && (
                  <p className="text-xs text-gray-500 mt-1">
                    Set the primary product price.
                  </p>
                )}
              </>
            )}
          />
        </div>

        {/* NEW: Last Price */}
        <div className="relative">
          <Label
            htmlFor="lastPrice"
            className="text-sm font-semibold text-gray-700 mb-1 block"
          >
            Last Price
          </Label>
          <FormField
            name="last_price"
            control={form.control}
            rules={{
              pattern: {
                value: /^[0-9]*\.?[0-9]*$/,
                message: "Only numbers are allowed",
              },
            }}
            render={({ field }) => (
              <FormControl>
                <Input
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : field.value
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const parsed = value === "" ? "" : Number(value);
                    field.onChange(isNaN(parsed) ? "" : parsed);
                  }}
                  id="lastPrice"
                  placeholder="0.00"
                  type="text"
                  className="rounded-lg border-gray-300 mt-1"
                />
              </FormControl>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional — previous or final sale price.
          </p>
        </div>
      </div>

      {/* Discount Type */}
      <div className="space-y-4 pt-2">
        <Label className="text-base font-bold text-gray-900">
          Discount Type <span className="text-red-500">*</span>
        </Label>
        {/* UPDATED: Design for radio button selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* No Discount */}
          <div
            className={`border rounded-xl p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200 ${Number(currentDiscountType) === 0
              ? "bg-gray-50 border-gray-400 shadow-sm"
              : "border-gray-200 hover:border-gray-400"
              }`}
            onClick={() => setValue("discount_type", 0)}
          >
            <input
              type="radio"
              id="noDiscount"
              name="discount_type"
              value={0}
              checked={Number(currentDiscountType) === 0}
              onChange={() => setValue("discount_type", 0)}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 cursor-pointer"
            />
            <Label
              htmlFor="noDiscount"
              className="text-sm font-medium cursor-pointer text-gray-800"
            >
              No Discount
            </Label>
          </div>

          {/* Percentage % */}
          <div
            className={`border rounded-xl p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200 ${currentDiscountType === "percentage"
              ? "bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500"
              : "border-gray-200 hover:border-blue-300"
              }`}
            onClick={() => {
              setValue("discount_type", "percentage");
              // Retain existing functionality: reset discount to 0 if previously selected type was percentage (to prevent value carryover on repeated clicks)
              currentDiscountType === "percentage"
                ? setValue("discount", 0)
                : null;
            }}
          >
            <input
              type="radio"
              id="percentage"
              name="discount_type"
              value="percentage"
              checked={currentDiscountType === "percentage"}
              onChange={() => {
                setValue("discount_type", "percentage");
                currentDiscountType === "percentage"
                  ? setValue("discount", 0)
                  : null;
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label
              htmlFor="percentage"
              className="text-sm font-medium cursor-pointer text-gray-800"
            >
              Percentage <span className="font-bold text-blue-600">%</span>
            </Label>
          </div>

          {/* Fixed Price */}
          <div
            className={`border rounded-xl p-4 flex items-center space-x-3 cursor-pointer transition-all duration-200 ${currentDiscountType === "fixed"
              ? "bg-green-50 border-green-500 shadow-md ring-1 ring-green-500"
              : "border-gray-200 hover:border-green-300"
              }`}
            onClick={() => {
              setValue("discount_type", "fixed");
              // Retain existing functionality: reset discount to 0 if previously selected type was fixed
              currentDiscountType === "fixed" ? setValue("discount", 0) : null;
            }}
          >
            <input
              type="radio"
              id="fixedPrice"
              name="discount_type"
              value="fixed"
              checked={currentDiscountType === "fixed"}
              onChange={() => {
                setValue("discount_type", "fixed");
                currentDiscountType === "fixed"
                  ? setValue("discount", 0)
                  : null;
              }}
              className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
            />
            <Label
              htmlFor="fixedPrice"
              className="text-sm font-medium cursor-pointer text-gray-800"
            >
              Fixed Price
            </Label>
          </div>
        </div>

        {/* Conditional Discount Input */}
        {currentDiscountType === "percentage" && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Label
              htmlFor="discountPercentage"
              className="text-sm font-semibold text-gray-700"
            >
              Set Discount Percentage <span className="text-red-500">*</span>
            </Label>
            <div className="relative pt-6">
              <input
                type="range"
                min="0"
                max="100"
                {...register("discount")}
                onChange={(e) =>
                  setValue("discount", Number.parseInt(e.target.value))
                }
                // UPDATED: Styling for a modern range slider
                className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:bg-blue-600"
                style={{
                  // Dynamic thumb position for precise value display
                  "--thumb-position": `${(watch("discount") / 100) * 100}%`,
                }}
              />
              <div
                className="absolute transition-all duration-150"
                style={{
                  left: `calc(${(watch("discount") / 100) * 100}% - 12px)`,
                  top: 0,
                }}
              >
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {watch("discount")}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-3">
              Set a percentage discount to be applied on this product.
            </p>
          </div>
        )}

        {currentDiscountType === "fixed" && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Label
              htmlFor="fixedDiscountedPrice"
              className="text-sm font-semibold text-gray-700"
            >
              Fixed Discounted Price <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("discount", {
                // Ensure value is numeric (integer or float)
                pattern: {
                  value: /^[0-9]*\.?[0-9]*$/,
                  message: "Only numbers are allowed",
                },
                // Apply a simple transform to numeric value on change
                onChange: (e) => {
                  const value = e.target.value;
                  const parsedValue = value === "" ? "" : Number(value);
                  setValue("discount", isNaN(parsedValue) ? "" : parsedValue);
                },
              })}
              id="fixedDiscountedPrice"
              placeholder="Discounted Price"
              type="text"
              className="rounded-lg border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Set the discounted product price. The product will be reduced at
              the determined fixed price.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
