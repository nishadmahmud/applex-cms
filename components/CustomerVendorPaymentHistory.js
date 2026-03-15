'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { useUpdateDueInvoiceMutation } from '@/app/store/api/dueInvoiceList';
import { useGetPaymentListQuery } from '@/app/store/api/paymentApi';
import { Edit, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { TbInvoice } from 'react-icons/tb';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';

export default function CustomerVendorPaymentHistory({ dueCollection }) {
    const [editPayment, setEditPayment] = useState(null);

    const [updateDueInvoice, { isLoading: isUpdating }] = useUpdateDueInvoiceMutation();

    // Payment types — categories are nested inside each type as payment_type_category[]
    const { data: paymentGateways } = useGetPaymentListQuery(undefined);
    const gatewayList = paymentGateways?.data?.data || [];

    // Modal form state
    const [transactionDate, setTransactionDate] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([
        { selectedGateway: null, payment_type_id: '', payment_type_category_id: '', payment_amount: '' },
    ]);

    // Open modal for a specific payment
    const openEditModal = (payment) => {
        setEditPayment(payment);
        const d = payment.created_at
            ? new Date(payment.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        setTransactionDate(d);

        // Default to Cash with the payment's amount
        const cashGateway = gatewayList.find((g) => g.type_name === 'Cash') || gatewayList[0] || null;
        const firstCat = cashGateway?.payment_type_category?.[0];
        setPaymentMethods([
            {
                selectedGateway: cashGateway,
                payment_type_id: cashGateway?.id || '',
                payment_type_category_id: firstCat?.id || '',
                payment_amount: payment.paid_amount || '',
            },
        ]);
    };

    const closeModal = () => {
        setEditPayment(null);
    };

    // Add another payment method row
    const addPaymentMethod = () => {
        setPaymentMethods((prev) => [
            ...prev,
            { selectedGateway: null, payment_type_id: '', payment_type_category_id: '', payment_amount: '' },
        ]);
    };

    // Remove a payment method row
    const removePaymentMethod = (index) => {
        if (paymentMethods.length <= 1) return;
        setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
    };

    // Update a specific payment method field
    const updatePaymentMethod = (index, field, value) => {
        setPaymentMethods((prev) =>
            prev.map((pm, i) => (i === index ? { ...pm, [field]: value } : pm))
        );
    };

    // When payment type changes
    const handlePaymentTypeChange = (index, typeId) => {
        const gateway = gatewayList.find((g) => g.id == typeId) || null;
        const firstCat = gateway?.payment_type_category?.[0];

        setPaymentMethods((prev) =>
            prev.map((pm, i) =>
                i === index
                    ? {
                        ...pm,
                        selectedGateway: gateway,
                        payment_type_id: gateway?.id || '',
                        payment_type_category_id: firstCat?.id || '',
                    }
                    : pm
            )
        );
    };

    // Total paid
    const totalPaid = paymentMethods.reduce(
        (sum, pm) => sum + (Number(pm.payment_amount) || 0),
        0
    );

    // Submit
    const handleSave = async () => {
        if (!editPayment) return;

        const validMethods = paymentMethods.filter(
            (pm) => pm.payment_type_id && Number(pm.payment_amount) > 0
        );

        if (validMethods.length === 0) {
            toast.error('Please select a payment method and enter an amount.');
            return;
        }

        const payload = {
            id: editPayment.id,
            paid_amount: totalPaid,
            date: transactionDate,
            multiple_payment: validMethods.map((pm) => ({
                payment_type_id: Number(pm.payment_type_id),
                payment_type_category_id: Number(pm.payment_type_category_id),
                payment_amount: Number(pm.payment_amount),
            })),
        };

        try {
            await updateDueInvoice(payload).unwrap();
            toast.success('Payment updated successfully!');
            closeModal();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update payment.');
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Payment History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="text-[10px]">
                                <TableHead className="text-[10px] text-nowrap font-bold">Date</TableHead>
                                <TableHead className="text-[10px] text-nowrap font-bold">Amount</TableHead>
                                <TableHead className="text-[10px] text-nowrap font-bold">Paid for</TableHead>
                                <TableHead className="text-[10px] text-nowrap font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dueCollection?.data && dueCollection?.data?.length ?
                                dueCollection.data.map((payment, index) => (
                                    <TableRow key={index} className="text-[10px]">
                                        <TableCell className="text-[10px] text-blue-600">{
                                            payment?.created_at &&
                                            new Date(
                                                payment.created_at
                                            ).toLocaleDateString('en-GB', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: '2-digit',
                                            })
                                        }</TableCell>
                                        <TableCell className="text-[10px]">{payment.paid_amount}</TableCell>
                                        <TableCell className="text-[10px]">Bill Pay</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-blue-600">
                                                    <TbInvoice className="h-3 w-3 mr-0.5" />
                                                    Invoice
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-[10px] text-blue-600"
                                                    onClick={() => openEditModal(payment)}
                                                >
                                                    <Edit className="h-3 w-3 mr-0.5" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : null}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ── Due Payment Edit Modal ── */}
            <Dialog open={!!editPayment} onOpenChange={(open) => { if (!open) closeModal(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Due Payment Edit</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 mt-2">
                        {/* Paid Due Display */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">Paid Due</span>
                            <span className="text-lg font-bold text-gray-900">{totalPaid}</span>
                        </div>

                        {/* Transaction Date */}
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Transaction Date</Label>
                            <Input
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        {/* Payment Method(s) */}
                        <div className="space-y-4">
                            {paymentMethods.map((pm, idx) => {
                                const gateway = pm.selectedGateway;
                                const accounts = gateway?.payment_type_category || [];
                                const selectedAcc = accounts.find((a) => a.id == pm.payment_type_category_id);

                                return (
                                    <div key={idx} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {gateway?.type_name || 'Payment'}
                                            </span>
                                            {paymentMethods.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => removePaymentMethod(idx)}
                                                >
                                                    <X className="w-4 h-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Method Name Dropdown */}
                                        <div>
                                            <Label className="text-xs text-gray-500">Method Name</Label>
                                            <select
                                                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        </div>

                                        {/* Account Name (non-cash only) */}
                                        {gateway?.type_name !== 'Cash' && accounts.length > 0 && (
                                            <>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Account Name</Label>
                                                    <select
                                                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={pm.payment_type_category_id}
                                                        onChange={(e) =>
                                                            updatePaymentMethod(idx, 'payment_type_category_id', e.target.value)
                                                        }
                                                    >
                                                        {accounts.map((acc) => (
                                                            <option key={acc.id} value={acc.id}>
                                                                {acc.payment_category_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Account Number — read-only */}
                                                {selectedAcc?.account_number && (
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Account Number</Label>
                                                        <Input
                                                            value={selectedAcc.account_number}
                                                            readOnly
                                                            className="mt-1 bg-gray-50 text-gray-500 cursor-default"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Amount */}
                                        <div>
                                            <Label className="text-xs text-gray-500">Amount</Label>
                                            <Input
                                                type="number"
                                                value={pm.payment_amount}
                                                onChange={(e) =>
                                                    updatePaymentMethod(idx, 'payment_amount', e.target.value)
                                                }
                                                placeholder="Enter amount"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add More Method */}
                        <div
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors"
                            onClick={addPaymentMethod}
                        >
                            <span className="text-sm font-medium text-gray-700">Pay with more Method</span>
                            <div className="h-8 w-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        {/* Save Button */}
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base rounded-xl"
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
