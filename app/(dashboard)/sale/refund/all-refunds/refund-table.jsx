"use client";
import { React } from "react";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import RefundActionModal from "./RefundActionModal";

export default function RefundTable({ refunds }) {
    if (!refunds || refunds.length === 0) {
        return (
            <div className="mt-6 text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No refund requests found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div className="mt-6 border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold w-[210px]">Date/Time</TableHead>
                        <TableHead className="font-semibold">Invoice & Customer</TableHead>
                        <TableHead className="font-semibold">Reason</TableHead>
                        <TableHead className="font-semibold text-center">Method</TableHead>
                        <TableHead className="font-semibold text-center w-[150px]">
                            Status
                        </TableHead>
                        <TableHead className="font-semibold text-right w-[120px]">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {refunds.map((refund) => {
                        const createdDate = new Date(refund.created_at || new Date());
                        const timeAgo = formatDistanceToNow(createdDate, {
                            addSuffix: true,
                        });

                        // Normalize status strictly (handle "1", 1, "approved", "pending", "2", "rejected", "0", 0)
                        let statusText = "Pending";
                        let statusClass = "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800";

                        const rawStatus = String(refund.status).toLowerCase();
                        if (rawStatus === "1" || rawStatus === "approved") {
                            statusText = "Approved";
                            statusClass = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
                        } else if (rawStatus === "2" || rawStatus === "rejected") {
                            statusText = "Rejected";
                            statusClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
                        }

                        return (
                            <TableRow key={refund.id} className="hover:bg-muted/30 align-top">
                                {/* Date / time */}
                                <TableCell className="align-top w-[210px]">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">
                                            {format(createdDate, "dd MMM, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                                    </div>
                                </TableCell>

                                {/* Invoice ID & Customer */}
                                <TableCell>
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-foreground">
                                            {refund.invoice_id}
                                        </p>
                                        {refund.customer && (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    {refund.customer.name || refund.customer.user_name || "Unknown Customer"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Phone: {refund.customer.phone || "-"}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Reason & Note */}
                                <TableCell className="align-top">
                                    <div className="space-y-0.5 max-w-[250px]">
                                        <p className="text-sm font-medium truncate" title={refund.reason}>
                                            {refund.reason || "-"}
                                        </p>
                                        {refund.reason_note && (
                                            <p className="text-xs text-muted-foreground truncate" title={refund.reason_note}>
                                                {refund.reason_note}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Refund Method */}
                                <TableCell className="align-top text-center">
                                    <span className="capitalize text-sm font-medium">
                                        {refund.refund_method || "-"}
                                    </span>
                                </TableCell>

                                {/* Status */}
                                <TableCell className="align-top text-center w-[150px]">
                                    <Badge variant="outline" className={statusClass}>
                                        {statusText}
                                    </Badge>
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right">
                                    <RefundActionModal refund={refund} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
