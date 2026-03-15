import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Percent, DollarSign, Scale } from "lucide-react";

// Helper function to format the discount value for display
const formatDiscountValue = (value, type) => {
  const formattedValue = parseFloat(value).toFixed(2);
  if (type === "percentage") {
    return `${formattedValue}%`;
  }
  return `৳ ${formattedValue}`; // Assuming '৳' is your currency, based on other code
};

// Helper function to get the correct icon
const getDiscountIcon = (type) => {
  if (type === "percentage") {
    return <Percent className="w-4 h-4 text-orange-600" />;
  }
  return <DollarSign className="w-4 h-4 text-orange-600" />;
};

// The core component for displaying all quantity discounts
export default function QuantityDiscountPack({ quantityDiscounts }) {
  if (!quantityDiscounts || quantityDiscounts.length === 0) {
    return null; // Don't render the card if there are no discounts
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* Using a different icon for visual distinction from bundles, e.g., Scale or Tag, but Package is also fine if you prefer. I'll use Scale for 'quantity'/'pack' visualization. */}
          <Scale className="w-5 h-5 text-orange-600" />
          Quantity Discounts (Pack Deals)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quantityDiscounts.map((discount, index) => (
          <div
            key={discount.id}
            className={`p-4 border-2 rounded-lg shadow-sm transition-all ${
              discount.discount_type === "percentage"
                ? "border-orange-200 bg-orange-50"
                : "border-teal-200 bg-teal-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getDiscountIcon(discount.discount_type)}
                <h4 className="text-lg font-bold text-gray-800">
                  Buy {discount.min_quantity}+ Items
                </h4>
              </div>
              <Badge
                className={`text-sm font-semibold ${
                  discount.discount_type === "percentage"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-teal-500 hover:bg-teal-600"
                } text-white`}
              >
                {discount.discount_type.charAt(0).toUpperCase() +
                  discount.discount_type.slice(1)}{" "}
                Discount
              </Badge>
            </div>

            <Separator className="my-3 opacity-50" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Min. Quantity
                </p>
                <p className="text-xl font-extrabold text-gray-900">
                  {discount.min_quantity}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Total Discount
                </p>
                <p
                  className={`text-xl font-extrabold ${
                    discount.discount_type === "percentage"
                      ? "text-orange-700"
                      : "text-teal-700"
                  }`}
                >
                  {formatDiscountValue(
                    discount.discount_value,
                    discount.discount_type
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Per Unit Price
                </p>
                <p className="text-lg font-bold text-green-700">
                  {/* Displaying absolute value of per_unit_price for 'saving' clarity */}
                  ৳ {Math.abs(discount.per_unit_price).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
