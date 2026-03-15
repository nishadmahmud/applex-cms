"use client";
import { React, useState, useEffect } from "react";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "hsl(var(--border))",
    backgroundColor: "hsl(var(--background))",
    minHeight: "38px",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    fontWeight: 500,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "hsl(var(--muted))"
      : "hsl(var(--background))",
    color: "hsl(var(--foreground))",
    cursor: "pointer",
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10000,
  }),
};

export function CouponForm({
  coupon,
  onSubmit,
  isLoading,
  submitLabel = "Save Coupon",
}) {
  const [formData, setFormData] = useState({
    coupon_name: "",
    coupon_code: "",
    amount: "",
    coupon_amount_type: "fixed",
    description: "",
    usage_limit: "",
    customer_usage_limit: "",
    minimum_order_amount: "",
    amount_limit: "",
    expire_date: "",
    new_user_only: false,
  });

  const [selectedDate, setSelectedDate] = useState();
  const [errors, setErrors] = useState({});

  const symbol = formData.coupon_amount_type === "percentage" ? "%" : "৳";

  useEffect(() => {
    if (coupon) {
      setFormData({
        coupon_name: coupon.coupon_name,
        coupon_code: coupon.coupon_code,
        amount: coupon.amount,
        coupon_amount_type: coupon.coupon_amount_type?.toString() || "fixed",
        description: coupon.description || "",
        usage_limit: coupon.usage_limit ?? "",
        customer_usage_limit: coupon.customer_usage_limit ?? "",
        minimum_order_amount: coupon.minimum_order_amount ?? "",
        amount_limit: coupon.amount_limit ?? "",
        expire_date: coupon.expire_date,
        new_user_only: Boolean(coupon.new_user_only),
      });
      if (coupon.expire_date) {
        setSelectedDate(new Date(coupon.expire_date));
      }
    }
  }, [coupon]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.coupon_name.trim())
      newErrors.coupon_name = "Coupon name is required.";
    if (!formData.coupon_code.trim())
      newErrors.coupon_code = "Coupon code is required.";
    if (!formData.amount) newErrors.amount = "Amount is required.";
    if (!formData.usage_limit && formData.usage_limit !== 0)
      newErrors.usage_limit = "Usage limit is required.";
    if (!selectedDate) newErrors.expire_date = "Expire date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      expire_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      new_user_only: formData.new_user_only ? 1 : 0,
    };
    onSubmit(submitData);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      expire_date: date ? format(date, "yyyy-MM-dd") : "",
    }));
    setErrors((prev) => ({ ...prev, expire_date: "" }));
  };

  const typeOptions = [
    { value: "fixed", label: "Fixed (৳)" },
    { value: "percentage", label: "Percentage (%)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="coupon_name">Coupon Name</Label>
          <Input
            id="coupon_name"
            value={formData.coupon_name}
            onChange={(e) => {
              setFormData((p) => ({ ...p, coupon_name: e.target.value }));
              setErrors((p) => ({ ...p, coupon_name: "" }));
            }}
            className={errors.coupon_name ? "border-destructive" : ""}
            placeholder="Enter coupon name"
            required
          />
          {errors.coupon_name && (
            <p className="text-xs text-destructive">{errors.coupon_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="coupon_code">Coupon Code</Label>
          <Input
            id="coupon_code"
            value={formData.coupon_code}
            onChange={(e) => {
              setFormData((p) => ({
                ...p,
                coupon_code: e.target.value.toUpperCase(),
              }));
              setErrors((p) => ({ ...p, coupon_code: "" }));
            }}
            className={errors.coupon_code ? "border-destructive" : ""}
            placeholder="Enter coupon code"
            required
          />
          {errors.coupon_code && (
            <p className="text-xs text-destructive">{errors.coupon_code}</p>
          )}
        </div>
      </div>

      {/* Amount and Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 relative">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => {
              setFormData((p) => ({ ...p, amount: e.target.value }));
              setErrors((p) => ({ ...p, amount: "" }));
            }}
            className={errors.amount ? "border-destructive pr-10" : "pr-10"}
            placeholder={`Enter discount amount (${symbol})`}
            required
          />
          <span className="absolute right-3 top-10 text-sm font-semibold text-muted-foreground">
            {symbol}
          </span>
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Amount Type</Label>
          <Select
            options={typeOptions}
            value={typeOptions.find(
              (opt) => opt.value === formData.coupon_amount_type
            )}
            onChange={(option) =>
              setFormData((prev) => ({
                ...prev,
                coupon_amount_type: option.value,
              }))
            }
            styles={selectStyles}
            placeholder="Select amount type"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            type="number"
            value={formData.usage_limit}
            onChange={(e) => {
              setFormData((p) => ({ ...p, usage_limit: e.target.value }));
              setErrors((p) => ({ ...p, usage_limit: "" }));
            }}
            className={errors.usage_limit ? "border-destructive" : ""}
            placeholder="Usage limit (0 = unlimited)"
            required
          />
          {errors.usage_limit && (
            <p className="text-xs text-destructive">{errors.usage_limit}</p>
          )}
        </div>
      </div>

      {/* Customer / Amount Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_usage_limit">Customer Usage Limit</Label>
          <Input
            id="customer_usage_limit"
            type="number"
            value={formData.customer_usage_limit}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                customer_usage_limit: e.target.value,
              }))
            }
            placeholder="Max per customer (0 = unlimited)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount_limit">Amount Limit</Label>
          <Input
            id="amount_limit"
            type="number"
            value={formData.amount_limit}
            onChange={(e) =>
              setFormData((p) => ({ ...p, amount_limit: e.target.value }))
            }
            placeholder={`Max discount (${symbol}, 0 = unlimited)`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
          <Input
            id="minimum_order_amount"
            type="number"
            value={formData.minimum_order_amount}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                minimum_order_amount: e.target.value,
              }))
            }
            placeholder="Minimum Order Amount (0 = unlimited)"
          />
        </div>

        {/* Expiration */}
        <div className="space-y-2">
          <Label>Expire Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                  errors.expire_date && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[999999]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
          {errors.expire_date && (
            <p className="text-xs text-destructive">{errors.expire_date}</p>
          )}
        </div>
      </div>
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Enter coupon description"
          rows={3}
        />
      </div>

      {/* Switch */}
      <div className="flex items-center space-x-2">
        <Switch
          id="new_user_only"
          checked={formData.new_user_only}
          onCheckedChange={(checked) =>
            setFormData((p) => ({ ...p, new_user_only: checked }))
          }
        />
        <Label htmlFor="new_user_only">New users only</Label>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
