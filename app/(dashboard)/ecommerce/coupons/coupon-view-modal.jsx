"use client";
import { React } from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UsersIcon, HashIcon, PercentIcon } from "lucide-react";
import { format } from "date-fns";

export function CouponViewModal({ coupon }) {
  if (!coupon) return null;

  const isExpired = new Date(coupon.expire_date) < new Date();
  const usagePercentage = (coupon.used_count / coupon.usage_limit) * 100;
  const symbol = coupon.coupon_amount_type === "percentage" ? "%" : "৳";

  const safeUnlimited = (value) =>
    Number(value) === 0 || value === "0" ? "Unlimited" : value;

  return (
    <div className="w-80 p-4 bg-background border border-border rounded-lg shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">{coupon.coupon_name}</h4>
          <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1">
            {coupon.coupon_code}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {symbol}
            {coupon.amount}
          </div>
          <Badge
            variant={isExpired ? "destructive" : "default"}
            className="text-xs"
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            Expires
          </div>
          <p className="text-xs font-medium">
            {format(new Date(coupon.expire_date), "MMM dd, yyyy")}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HashIcon className="h-3 w-3" />
            Usage
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>
                {coupon.used_count} / {safeUnlimited(coupon.usage_limit)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="text-muted-foreground">Customer Limit</div>
          <div>{safeUnlimited(coupon.customer_usage_limit)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Amount Limit</div>
          <div>
            {symbol}
            {safeUnlimited(coupon.amount_limit)}
          </div>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="text-muted-foreground">Minimum Order Amount</div>
        <div>
          {symbol}
          {safeUnlimited(coupon.minimum_order_amount)}
        </div>
      </div>

      {coupon.description && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Description</div>
          <div
            className="text-xs text-foreground line-clamp-2"
            dangerouslySetInnerHTML={{ __html: coupon.description }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <UsersIcon className="h-3 w-3" />
          {coupon.new_user_only ? "New users" : "All users"}
        </div>
        <div>Created: {format(new Date(coupon.created_at), "MMM dd")}</div>
      </div>
    </div>
  );
}
