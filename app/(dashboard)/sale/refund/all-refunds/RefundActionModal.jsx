"use client";
import { React, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, Check, X, LoaderCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdateRefundMutation } from "@/app/store/api/refundApi";

export default function RefundActionModal({ refund }) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(String(refund.status).toLowerCase());
    const [refundMethod, setRefundMethod] = useState(refund.refund_method || "");

    const [updateRefund, { isLoading }] = useUpdateRefundMutation();

    // Normalize initial status to readable strings for the Select
    const getNormalizedStatus = (val) => {
        if (val === "1" || val === "approved") return "approved";
        if (val === "2" || val === "rejected") return "rejected";
        return "pending";
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (open) {
            setStatus(getNormalizedStatus(String(refund.status).toLowerCase()));
            setRefundMethod(refund.refund_method || "");
        }
    };

    const handleUpdate = async () => {
        if (!status) {
            toast.error("Please select a status");
            return;
        }

        try {
            const payload = {
                invoice_id: refund.invoice_id,
                customer_id: refund.customer_id,
                reason: refund.reason,
                reason_note: refund.reason_note,
                attachment: refund.attachment,
                courier_info: refund.courier_info,
                refund_method: refundMethod,
                status: status, // "approved" or "rejected"
                refund_details: refund.refund_details || [],
            };

            const res = await updateRefund({
                id: refund.id,
                payload,
                token: session?.accessToken,
            }).unwrap();

            if (res?.success || res?.status === "success") {
                toast.success("Refund request updated successfully");
                setIsOpen(false);
            } else {
                toast.error(res?.message || "Failed to update refund request");
            }
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Error updating refund request");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950 bg-transparent"
                >
                    REVIEW
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Refund Request</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Details Section */}
                    <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                Invoice & Customer
                            </Label>
                            <div className="font-medium">{refund.invoice_id}</div>
                            <div className="text-sm">
                                Customer ID: {refund.customer_id}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Reason
                                </Label>
                                <div className="font-medium text-sm">{refund.reason || "-"}</div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                    Requested Method
                                </Label>
                                <div className="font-medium text-sm capitalize">
                                    {refund.refund_method || "-"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                                Reason Note
                            </Label>
                            <div className="text-sm border p-2 rounded-md bg-background mt-1 min-h-[60px]">
                                {refund.reason_note || "No note provided."}
                            </div>
                        </div>

                        {refund.attachment && (
                            <div>
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                                    Proof / Attachment
                                </Label>
                                <div className="mt-1">
                                    <a
                                        href={refund.attachment?.startsWith("http") ? refund.attachment : `${process.env.NEXT_PUBLIC_IMG_URL}/${refund.attachment}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block relative rounded-md overflow-hidden border border-border group w-[150px] sm:w-[200px]"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={refund.attachment?.startsWith("http") ? refund.attachment : `${process.env.NEXT_PUBLIC_IMG_URL}/${refund.attachment}`}
                                            alt="Refund Proof"
                                            className="w-full h-auto object-cover max-h-[150px] min-h-[100px] bg-muted"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink className="h-6 w-6 text-white" />
                                        </div>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Returned Items */}
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
                            Returned Items ({refund?.refund_details?.length || 0})
                        </Label>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground text-xs">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Product / Variant ID</th>
                                        <th className="px-3 py-2 font-medium text-center">Qty</th>
                                        <th className="px-3 py-2 font-medium text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {refund?.refund_details?.length > 0 ? (
                                        refund.refund_details.map((item, idx) => (
                                            <tr key={idx} className="bg-background">
                                                <td className="px-3 py-2">
                                                    <div>Product ID: {item.product_id}</div>
                                                    {item.product_variant_id && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Variant ID: {item.product_variant_id}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 text-center">{item.qty}</td>
                                                <td className="px-3 py-2 text-right">
                                                    {formatCurrency(item.price)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="bg-background">
                                            <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                                                No items detailed
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Admin Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Update Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Final Refund Method</Label>
                            <Select value={refundMethod} onValueChange={setRefundMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="bkash">bKash</SelectItem>
                                    <SelectItem value="nagad">Nagad</SelectItem>
                                    <SelectItem value="rocket">Rocket</SelectItem>
                                    <SelectItem value="store_credit">Store Credit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                        {isLoading ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" /> Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
