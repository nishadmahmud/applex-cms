"use client";
import React from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHead,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default function AllWholeSaleInvoiceTable({ invoices }) {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const calcDue = (sub, paid) => sub - paid;

  if (!invoices || invoices.length === 0) {
    return (
      <div className="mt-6 text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No wholesale invoices found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Wholeseller</TableHead>
            <TableHead className="font-semibold text-right">
              Total Amount
            </TableHead>
            <TableHead className="font-semibold text-right">Due</TableHead>
            <TableHead className="font-semibold">Date / Time</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const due = calcDue(inv.sub_total, inv.paid_amount);
            const created = new Date(inv.created_at);
            const timeAgo = formatDistanceToNow(created, { addSuffix: true });

            return (
              <TableRow key={inv.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {inv.wholeseller?.name || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {inv.invoice_id}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(inv.sub_total)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(due)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {format(created, "dd MMM, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      inv.status == 1
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {inv.status == 1 ? "Completed" : "Hold"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/invoice/${inv.invoice_id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        VIEW
                      </Button>
                    </Link>
                    <Link href={`/invoice/edit/${inv.invoice_id}`}>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        EDIT
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
