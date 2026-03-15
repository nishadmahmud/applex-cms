// QuantityDiscountFields.jsx
import React from "react";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "1000"], // optional
});

export default function QuantityDiscountFields({ form, product }) {
  const { control, register } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quantity_discounts",
  });

  // Watch the entire quantity_discounts array for dynamic content
  const quantityDiscounts = useWatch({
    control,
    name: "quantity_discounts",
    defaultValue: [],
  });

  const handleAddDiscount = () => {
    append({
      min_quantity: "",
      discount_type: "amount", // Default to 'amount'
      discount_value: "",
    });
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${nunito.className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Quantity Discounts (Packs)
      </h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-end gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
          >
            {/* Discount ID (Hidden for existing items) */}
            {field.id && (
              <input
                type="hidden"
                {...register(`quantity_discounts.${index}.id`)}
              />
            )}

            {/* Minimum Quantity */}
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor={`min_quantity-${index}`}>Min Quantity</Label>
              <Input
                id={`min_quantity-${index}`}
                type="number"
                min="1"
                placeholder="e.g. 5"
                {...register(`quantity_discounts.${index}.min_quantity`, {
                  valueAsNumber: true,
                  required: "Min quantity is required",
                })}
              />
              {form.formState.errors.quantity_discounts?.[index]
                ?.min_quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {
                    form.formState.errors.quantity_discounts[index].min_quantity
                      .message
                  }
                </p>
              )}
            </div>

            {/* Discount Type */}
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor={`discount_type-${index}`}>Discount Type</Label>
              <Controller
                name={`quantity_discounts.${index}.discount_type`}
                control={control}
                rules={{ required: "Type is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Discount Value */}
            <div className="flex-1 min-w-[120px]">
              <Label htmlFor={`discount_value-${index}`}>
                Discount Value
                {quantityDiscounts[index]?.discount_type === "percentage"
                  ? " (%)"
                  : ""}
              </Label>
              <Input
                id={`discount_value-${index}`}
                type="number"
                step="0.01"
                min="0"
                placeholder={
                  quantityDiscounts[index]?.discount_type === "percentage"
                    ? "e.g. 10"
                    : "e.g. 500.00"
                }
                {...register(`quantity_discounts.${index}.discount_value`, {
                  valueAsNumber: true,
                  required: "Discount value is required",
                })}
              />
              {form.formState.errors.quantity_discounts?.[index]
                ?.discount_value && (
                <p className="text-red-500 text-xs mt-1">
                  {
                    form.formState.errors.quantity_discounts[index]
                      .discount_value.message
                  }
                </p>
              )}
            </div>

            {/* Remove Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="ml-4 flex-shrink-0 border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-2 w-full border-blue-500 text-blue-600 hover:bg-blue-50"
        onClick={handleAddDiscount}
      >
        + Add Quantity Discount
      </Button>
    </div>
  );
}
