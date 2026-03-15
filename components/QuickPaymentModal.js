"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    ExternalLink,
    Plus,
    X,
    Search,
    User,
    Store,
    Receipt,
    Loader2,
} from "lucide-react";

import {
    useGetCustomerListQuery,
    useSearchCustomerQuery,
} from "@/app/store/api/saleCustomerApi";
import {
    useGetVendorListQuery,
    useSearchVendorQuery,
} from "@/app/store/api/purchaseVendorApi";
import {
    useGetCustomerDueInvoiceListQuery,
    useGetVendorDueInvoiceListQuery,
    useUpdateDueCollectionMutation,
} from "@/app/store/api/dueInvoiceList";
import { useGetPaymentListQuery } from "@/app/store/api/paymentApi";
import { useSession } from "next-auth/react";

export default function QuickPaymentModal({ open, onClose, initialMode = "customer" }) {
    const { data: session } = useSession();
    const [mode, setMode] = useState(initialMode);

    // Person selection
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Payment form
    const [selectedInvoice, setSelectedInvoice] = useState("");
    const [payAmount, setPayAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethods, setPaymentMethods] = useState([
        { payment_type_id: "", payment_type_category_id: "", payment_amount: "", selectedGateway: null },
    ]);

    // APIs
    const { data: customerList } = useGetCustomerListQuery(
        { page: 1, limit: 1000 },
        { skip: mode !== "customer" || !open }
    );
    const { data: vendorList } = useGetVendorListQuery(
        { page: 1, limit: 1000 },
        { skip: mode !== "vendor" || !open }
    );
    const { data: customerSearchData } = useSearchCustomerQuery(searchTerm, {
        skip: mode !== "customer" || !searchTerm.trim(),
    });
    const { data: vendorSearchData } = useSearchVendorQuery(searchTerm, {
        skip: mode !== "vendor" || !searchTerm.trim(),
    });

    const { data: customerDueInvoices } = useGetCustomerDueInvoiceListQuery(
        { id: selectedPerson?.id },
        { skip: !selectedPerson?.id || mode !== "customer" }
    );
    const { data: vendorDueInvoices } = useGetVendorDueInvoiceListQuery(
        { id: selectedPerson?.id },
        { skip: !selectedPerson?.id || mode !== "vendor" }
    );

    const { data: paymentGateways } = useGetPaymentListQuery(undefined, { skip: !open });
    const gatewayList = paymentGateways?.data?.data || [];

    const [updateDueCollection, { isLoading: saving }] = useUpdateDueCollectionMutation();

    // Derived data
    const people = searchTerm.trim()
        ? (mode === "customer" ? customerSearchData?.data?.data : vendorSearchData?.data?.data) || []
        : (mode === "customer" ? customerList?.data?.data : vendorList?.data?.data) || [];

    const dueInvoices = (mode === "customer" ? customerDueInvoices?.data : vendorDueInvoices?.data) || [];

    const totalDue = dueInvoices.reduce((sum, inv) => sum + (Number(inv?.total_due) || 0), 0);

    const selectedInvoiceDue = selectedInvoice
        ? dueInvoices.find((inv) =>
            mode === "customer"
                ? inv.sale_invoice_id === selectedInvoice
                : inv.purchase_invoice_id === selectedInvoice
        )?.total_due
        : totalDue;

    // Reset on mode change
    useEffect(() => {
        setSearchTerm("");
        setSelectedPerson(null);
        setShowDropdown(false);
        resetPaymentForm();
    }, [mode]);

    // Reset on close
    useEffect(() => {
        if (open) {
            setMode(initialMode);
            setSearchTerm("");
            setSelectedPerson(null);
            setShowDropdown(false);
            resetPaymentForm();
        }
    }, [open, initialMode]);

    // Auto-set default payment method to Cash
    useEffect(() => {
        if (gatewayList.length && paymentMethods[0] && !paymentMethods[0].payment_type_id) {
            const cash = gatewayList.find((g) => g.type_name === "Cash") || gatewayList[0];
            const firstCat = cash?.payment_type_category?.[0];
            setPaymentMethods([
                {
                    payment_type_id: cash?.id || "",
                    payment_type_category_id: firstCat?.id || "",
                    payment_amount: "",
                    selectedGateway: cash,
                },
            ]);
        }
    }, [gatewayList]);

    const resetPaymentForm = () => {
        setSelectedInvoice("");
        setPayAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        const cash = gatewayList.find((g) => g.type_name === "Cash") || gatewayList[0];
        const firstCat = cash?.payment_type_category?.[0];
        setPaymentMethods([
            {
                payment_type_id: cash?.id || "",
                payment_type_category_id: firstCat?.id || "",
                payment_amount: "",
                selectedGateway: cash,
            },
        ]);
    };

    const handlePaymentTypeChange = (index, typeId) => {
        const gateway = gatewayList.find((g) => g.id == typeId) || null;
        const firstCat = gateway?.payment_type_category?.[0];
        setPaymentMethods((prev) =>
            prev.map((pm, i) =>
                i === index
                    ? { ...pm, selectedGateway: gateway, payment_type_id: gateway?.id || "", payment_type_category_id: firstCat?.id || "" }
                    : pm
            )
        );
    };

    const addPaymentMethod = () => {
        setPaymentMethods((prev) => [
            ...prev,
            { payment_type_id: "", payment_type_category_id: "", payment_amount: "", selectedGateway: null },
        ]);
    };

    const removePaymentMethod = (index) => {
        if (paymentMethods.length <= 1) return;
        setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
    };

    const updatePaymentMethod = (index, field, value) => {
        setPaymentMethods((prev) =>
            prev.map((pm, i) => (i === index ? { ...pm, [field]: value } : pm))
        );
    };

    const totalPaid = paymentMethods.reduce((sum, pm) => sum + (Number(pm.payment_amount) || 0), 0);

    const handleSubmit = async () => {
        if (!selectedPerson) {
            toast.error("Please select a " + (mode === "customer" ? "customer" : "vendor") + " first.");
            return;
        }

        const validMethods = paymentMethods.filter(
            (pm) => pm.payment_type_id && Number(pm.payment_amount) > 0
        );
        if (validMethods.length === 0) {
            toast.error("Please add at least one payment method with an amount.");
            return;
        }

        const paidAmount = validMethods.reduce((sum, pm) => sum + Number(pm.payment_amount), 0);

        const invoiceId = selectedInvoice || "";

        const payload =
            mode === "customer"
                ? {
                    previous_due: selectedInvoiceDue,
                    paid_amount: paidAmount,
                    payment_method: validMethods.map((pm) => ({
                        payment_type_id: Number(pm.payment_type_id),
                        payment_type_category_id: Number(pm.payment_type_category_id),
                        payment_amount: Number(pm.payment_amount),
                    })),
                    sale_invoice_id: invoiceId,
                    purchase_invoice_id: invoiceId,
                    exporter_invoice_id: invoiceId,
                    carrier_invoice_id: invoiceId,
                    wholesale_invoice_id: invoiceId,
                    custom_date: date,
                    customer_id: selectedPerson.id,
                }
                : {
                    previous_due: selectedInvoiceDue,
                    paid_amount: paidAmount,
                    payment_method: validMethods.map((pm) => ({
                        payment_type_id: Number(pm.payment_type_id),
                        payment_type_category_id: Number(pm.payment_type_category_id),
                        payment_amount: Number(pm.payment_amount),
                    })),
                    sale_invoice_id: invoiceId,
                    purchase_invoice_id: invoiceId,
                    exporter_invoice_id: invoiceId,
                    carrier_invoice_id: invoiceId,
                    wholesale_invoice_id: invoiceId,
                    custom_date: date,
                    vendor_id: selectedPerson.id,
                };

        try {
            const res = await updateDueCollection(payload).unwrap();
            if (res.success) {
                toast.success(res.message || "Payment saved successfully!");
                resetPaymentForm();
                setSelectedPerson(null);
                setSearchTerm("");
            } else {
                toast.error("Payment failed. Try again.");
            }
        } catch (err) {
            toast.error(err?.data?.message || "Error saving payment.");
        }
    };

    const fullPageHref = selectedPerson
        ? mode === "customer"
            ? `/sale/customers/customer/${selectedPerson.id}?interval=daily`
            : `/purchase/vendors/vendor/${selectedPerson.id}?interval=daily`
        : mode === "customer"
            ? "/sale/customers"
            : "/purchase/vendors";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0">
                {/* Header */}
                <DialogHeader className="px-5 pt-5 pb-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-blue-600" />
                            Quick Payment
                        </DialogTitle>
                        <Link
                            href={fullPageHref}
                            onClick={() => onClose(false)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium mr-6"
                        >
                            <ExternalLink className="w-3 h-3" />
                            View Full Page
                        </Link>
                    </div>
                </DialogHeader>

                <div className="px-5 pb-5 space-y-4 min-h-[450px]">
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setMode("customer")}
                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 font-medium rounded-md transition-all ${mode === "customer"
                                ? "bg-white shadow-sm text-indigo-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            Customer Payment
                        </button>
                        <button
                            onClick={() => setMode("vendor")}
                            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 font-medium rounded-md transition-all ${mode === "vendor"
                                ? "bg-white shadow-sm text-emerald-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Store className="w-3.5 h-3.5" />
                            Vendor Payment
                        </button>
                    </div>

                    {/* Person Search */}
                    <div className="relative">
                        <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            {mode === "customer" ? "Select Customer" : "Select Vendor"}
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder={
                                    mode === "customer"
                                        ? "Search customer by name or phone..."
                                        : "Search vendor by name or phone..."
                                }
                                value={selectedPerson ? selectedPerson.name : searchTerm}
                                onChange={(e) => {
                                    if (selectedPerson) {
                                        setSelectedPerson(null);
                                        resetPaymentForm();
                                    }
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="pl-9 h-9 text-sm"
                            />
                            {selectedPerson && (
                                <button
                                    onClick={() => {
                                        setSelectedPerson(null);
                                        setSearchTerm("");
                                        resetPaymentForm();
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
                                >
                                    <X className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && !selectedPerson && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                                {people.length === 0 ? (
                                    <div className="p-3 text-center text-sm text-gray-500">
                                        {searchTerm.trim() ? "No results found" : "Type to search..."}
                                    </div>
                                ) : (
                                    people.slice(0, 20).map((person) => (
                                        <div
                                            key={person.id}
                                            onClick={() => {
                                                setSelectedPerson(person);
                                                setSearchTerm("");
                                                setShowDropdown(false);
                                            }}
                                            className="flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{person.name}</p>
                                                <p className="text-[11px] text-gray-500">{person.mobile_number || "No phone"}</p>
                                            </div>
                                            {person.total_due_amount > 0 && (
                                                <span className="text-[11px] font-semibold text-red-600 whitespace-nowrap ml-2">
                                                    Due: ৳{Number(person.total_due_amount).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Person Info + Due Summary */}
                    {selectedPerson && (
                        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{selectedPerson.name}</p>
                                    <p className="text-[11px] text-gray-500">{selectedPerson.mobile_number || "-"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Due</p>
                                    <p className="text-lg font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
                                </div>
                            </div>
                            <Link
                                href={fullPageHref}
                                onClick={() => onClose(false)}
                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Full Profile
                            </Link>
                        </div>
                    )}

                    {/* Payment Form */}
                    {selectedPerson && (
                        <div className="space-y-3 pt-1">
                            {/* Invoice Selector */}
                            <div>
                                <Label className="text-xs font-semibold text-gray-600">Invoice (Optional)</Label>
                                <select
                                    value={selectedInvoice}
                                    onChange={(e) => setSelectedInvoice(e.target.value)}
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Invoices (Total Due: ৳{totalDue.toLocaleString()})</option>
                                    {dueInvoices.map((inv) => {
                                        const invId = mode === "customer" ? inv.sale_invoice_id : inv.purchase_invoice_id;
                                        return (
                                            <option key={invId} value={invId}>
                                                {invId} — Due: ৳{Number(inv.total_due).toLocaleString()}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <Label className="text-xs font-semibold text-gray-600">Transaction Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="mt-1 h-9 text-sm"
                                />
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold text-gray-600">Payment Method</Label>
                                {paymentMethods.map((pm, idx) => {
                                    const gateway = pm.selectedGateway;
                                    const accounts = gateway?.payment_type_category || [];

                                    return (
                                        <div key={idx} className="space-y-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {gateway?.type_name || "Select Method"}
                                                </span>
                                                {paymentMethods.length > 1 && (
                                                    <button
                                                        onClick={() => removePaymentMethod(idx)}
                                                        className="p-0.5 rounded hover:bg-red-50"
                                                    >
                                                        <X className="w-3.5 h-3.5 text-red-500" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Method */}
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={pm.payment_type_id}
                                                onChange={(e) => handlePaymentTypeChange(idx, e.target.value)}
                                            >
                                                <option value="">Select Method</option>
                                                {gatewayList.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.type_name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Account (non-cash) */}
                                            {gateway?.type_name !== "Cash" && accounts.length > 0 && (
                                                <select
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={pm.payment_type_category_id}
                                                    onChange={(e) => updatePaymentMethod(idx, "payment_type_category_id", e.target.value)}
                                                >
                                                    {accounts.map((acc) => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.payment_category_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {/* Amount */}
                                            <Input
                                                type="number"
                                                value={pm.payment_amount}
                                                onChange={(e) => updatePaymentMethod(idx, "payment_amount", e.target.value)}
                                                placeholder="Enter amount"
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                    );
                                })}

                                {/* Add more method */}
                                <button
                                    onClick={addPaymentMethod}
                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add another payment method
                                </button>
                            </div>

                            {/* Summary & Pay Button */}
                            <div className="pt-2 border-t space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Total Paying</span>
                                    <span className="text-lg font-bold text-gray-900">৳{totalPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={saving || totalPaid <= 0}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 text-sm rounded-xl"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Pay Now"
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => onClose(false)} className="py-5 rounded-xl">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </DialogContent>
        </Dialog>
    );
}
