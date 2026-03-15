/* eslint-disable react/prop-types */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductSelector from "./ProductSelector";

export default function SalesTargetForm({
  targetMonth,
  targetQuantity,
  targetAmount,
  note,
  selectedProductId,
  products,
  isLoadingProducts,
  searchQuery,
  onSearch,
  onChange,
  onSubmit,
  onProductSelect,
  isSubmitting,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Sales Target</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
          {/* Month */}
          <div>
            <label className="text-sm font-medium">Target Month</label>
            <Input
              type="month"
              placeholder="Select month"
              value={targetMonth}
              onChange={(e) => onChange("month", e.target.value)}
            />
          </div>

          {/* Product */}
          <div>
            <label className="text-sm font-medium">Product</label>
            <ProductSelector
              products={products}
              isLoading={isLoadingProducts}
              searchQuery={searchQuery}
              onSearch={onSearch}
              selectedProductId={selectedProductId}
              onSelect={onProductSelect}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium">Target Quantity</label>
            <Input
              type="number"
              placeholder="Enter target quantity"
              value={targetQuantity}
              onChange={(e) =>
                onChange(
                  "quantity",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium">Target Amount</label>
            <Input
              type="number"
              placeholder="Enter target amount"
              value={targetAmount}
              onChange={(e) =>
                onChange(
                  "amount",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            />
          </div>

          {/* Note */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Note</label>
            <Input
              placeholder="Optional note"
              value={note}
              onChange={(e) => onChange("note", e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="col-span-2 text-right">
            <Button
              type="submit"
              disabled={
                !targetMonth ||
                !selectedProductId ||
                !targetQuantity ||
                !targetAmount ||
                isSubmitting
              }
            >
              {isSubmitting ? "Saving..." : "Save Target"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
