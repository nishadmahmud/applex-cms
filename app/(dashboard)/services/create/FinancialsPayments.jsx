import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useGetPaymentListQuery } from "@/app/store/api/paymentApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FinancialsPayments({ formData, setFormData }) {
    const { data: paymentTypesRes } = useGetPaymentListQuery();
    const paymentTypes = paymentTypesRes?.data?.data || paymentTypesRes?.data || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const addPaymentMethod = () => {
        setFormData((prev) => ({
            ...prev,
            payment_method: [
                ...prev.payment_method,
                { payment_type_id: "", payment_type_category_id: "", payment_amount: 0, reference: "" },
            ],
        }));
    };

    const removePaymentMethod = (index) => {
        setFormData((prev) => ({
            ...prev,
            payment_method: prev.payment_method.filter((_, i) => i !== index),
        }));
    };

    const updatePaymentMethod = (index, key, value) => {
        setFormData((prev) => {
            const newM = [...prev.payment_method];
            newM[index] = { ...newM[index], [key]: value };

            // When payment type changes, auto-select the first category
            if (key === "payment_type_id") {
                const selectedType = paymentTypes.find((t) => t.id.toString() === value);
                const firstCat = selectedType?.payment_type_category?.[0];
                newM[index].payment_type_category_id = firstCat ? firstCat.id.toString() : "";
            }

            return { ...prev, payment_method: newM };
        });
    };

    // Auto Calculations
    useEffect(() => {
        const f = formData;
        const totalPayments = f.payment_method.reduce(
            (sum, p) => sum + Number(p.payment_amount || 0),
            0
        );
        const calculatedTotal = Number(f.fees) + Number(f.vat) + Number(f.tax) - Number(f.discount);

        // Set paid dynamically based on the payments array
        const newPaidAmount = totalPayments;
        const diff = newPaidAmount - calculatedTotal;

        setFormData((prev) => ({
            ...prev,
            total: calculatedTotal > 0 ? calculatedTotal : 0,
            paid_amount: newPaidAmount,
            return_amount: diff > 0 ? diff : 0,
            due_amount: Math.max(calculatedTotal - newPaidAmount, 0),
        }));
    }, [
        formData.fees,
        formData.vat,
        formData.tax,
        formData.discount,
        formData.payment_method,
    ]);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Financials</h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Service Fees</Label>
                    <Input name="fees" type="number" value={formData.fees} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label>VAT</Label>
                    <Input name="vat" type="number" value={formData.vat} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label>Tax</Label>
                    <Input name="tax" type="number" value={formData.tax} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input name="discount" type="number" value={formData.discount} onChange={handleChange} />
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md">
                <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input value={formData.total} readOnly className="bg-white font-bold" />
                </div>
                <div className="space-y-2">
                    <Label>Paid Amount</Label>
                    <Input value={formData.paid_amount} readOnly className="bg-white font-bold text-green-600" />
                </div>
                <div className="space-y-2">
                    <Label>Return Amount</Label>
                    <Input value={formData.return_amount} readOnly className="bg-white text-orange-600" />
                </div>
                <div className="space-y-2">
                    <Label>Due Amount</Label>
                    <Input value={formData.due_amount} readOnly className="bg-white text-red-600 font-bold" />
                </div>
            </div>

            <div className="mt-8 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Payment Information</h3>
                    <Button onClick={addPaymentMethod} variant="outline" size="sm" type="button">
                        <Plus className="w-4 h-4 mr-2" /> Add Payment
                    </Button>
                </div>

                {formData.payment_method.map((pay, index) => {
                    const selectedType = paymentTypes.find((t) => t.id.toString() === pay.payment_type_id?.toString());
                    const categories = selectedType?.payment_type_category || [];
                    const selectedCat = categories.find((c) => c.id.toString() === pay.payment_type_category_id?.toString());

                    return (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-md relative mb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => removePaymentMethod(index)}
                                type="button"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>

                            <div className="space-y-2 md:col-span-3">
                                <Label>Payment Type</Label>
                                <Select
                                    value={pay.payment_type_id?.toString() || ""}
                                    onValueChange={(val) => updatePaymentMethod(index, "payment_type_id", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentTypes.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.type_name || t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label>Account</Label>
                                <Select
                                    value={pay.payment_type_category_id?.toString() || ""}
                                    onValueChange={(val) => updatePaymentMethod(index, "payment_type_category_id", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.payment_category_name} ({c.account_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedCat && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Account No.</Label>
                                    <Input value={selectedCat.account_number || ""} readOnly className="bg-gray-50" />
                                </div>
                            )}

                            <div className={`space-y-2 ${selectedCat ? 'md:col-span-2' : 'md:col-span-2'}`}>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={pay.payment_amount}
                                    onChange={(e) => updatePaymentMethod(index, "payment_amount", Number(e.target.value))}
                                />
                            </div>

                            <div className={`space-y-2 ${selectedCat ? 'md:col-span-2' : 'md:col-span-3'}`}>
                                <Label>Reference/Txn ID</Label>
                                <Input
                                    value={pay.reference}
                                    onChange={(e) => updatePaymentMethod(index, "reference", e.target.value)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
