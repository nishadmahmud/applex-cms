"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CouponViewModal } from "./coupon-view-modal";

export function CouponListItem({ coupon, onView, onEdit, onDelete, index }) {
  const isExpired = new Date(coupon.expire_date) < new Date();
  const symbol = coupon.coupon_amount_type === "percentage" ? "%" : "৳";

  const handleDeleteClick = () => {
    toast("Delete Coupon", {
      description: `Are you sure you want to delete "${coupon.coupon_name}"? This action cannot be undone.`,
      action: {
        label: "Delete",
        onClick: () => onDelete(coupon.id),
      },
      cancel: {
        label: "Cancel",
      },
    });
  };

  return (
    <div className="grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 py-4 border-b border-border items-center hover:bg-muted/50 transition-colors">
      <div>{index}</div>

      <Popover>
        <PopoverTrigger asChild>
          <div className="font-medium cursor-pointer hover:text-primary transition-colors">
            <div className="font-semibold">{coupon.coupon_name}</div>
            <div className="text-sm text-muted-foreground font-mono">
              {coupon.coupon_code}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="p-0 w-auto">
          <CouponViewModal coupon={coupon} />
        </PopoverContent>
      </Popover>

      <div className="text-sm text-muted-foreground font-medium">
        {coupon.new_user_only ? "New Users" : "All Users"}
      </div>

      <div className="text-center font-medium capitalize">
        {coupon.coupon_amount_type || "fixed"}
      </div>

      <div className="text-center">
        <Badge variant={isExpired ? "destructive" : "default"}>
          {isExpired ? "Expired" : "Active"}
        </Badge>
      </div>

      <div className="text-center font-semibold">
        {format(new Date(coupon.expire_date), "MMM dd, yyyy")}
      </div>

      <div className="text-center">
        <div className="font-semibold">
          {format(new Date(coupon.created_at), "MMM dd, yyyy")}
        </div>
        <div className="text-xs text-muted-foreground">
          {symbol}
          {coupon.amount} • {coupon.used_count}/
          {coupon.usage_limit === 0 ? "Unlimited" : coupon.usage_limit} used
        </div>
      </div>

      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Popover>
              <PopoverTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
              </PopoverTrigger>
              <PopoverContent side="left" align="start" className="p-0 w-auto">
                <CouponViewModal coupon={coupon} />
              </PopoverContent>
            </Popover>
            <DropdownMenuItem onClick={() => onEdit(coupon)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
