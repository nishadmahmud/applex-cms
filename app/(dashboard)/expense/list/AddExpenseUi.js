"use client";
import {
  useAddExpenseMutation,
  useGetExpenseTypeListQuery,
} from "@/app/store/api/expenseApi";
import { useGetPaymentExpenseTypeListQuery } from "@/app/store/api/quickPaymentApi";
import PaymentMethods from "@/components/PaymentMethods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, FileText, Save, Tag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AddExpenseUi({ onClose }) {
  const pathname = usePathname();
  const isExpenseRoute = pathname.includes("expense");

  const [formData, setFormData] = useState({
    expense_type_id: "",
    catogory_name: "",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
    type_id: isExpenseRoute ? 1 : 0,
  });

  const [payAmount, setPayAmount] = useState();
  const [selectedAccount, setSelectedAccount] = useState();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const { data: expenseTypes } = isExpenseRoute
    ? useGetExpenseTypeListQuery()
    : useGetPaymentExpenseTypeListQuery();
  const [addExpense] = useAddExpenseMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const prevExpenseNameRef = useRef("");

  useEffect(() => {
    const selected = expenseTypes?.data?.find(
      (item) => item.id == formData.expense_type_id,
    )?.expense_name;

    // Only auto-set category_name if user hasn't manually changed it
    if (
      !formData.catogory_name ||
      formData.catogory_name === prevExpenseNameRef.current
    ) {
      setFormData((prev) => {
        prevExpenseNameRef.current = selected || "";
        return {
          ...prev,
          catogory_name: selected || "",
        };
      });
    }
  }, [formData.expense_type_id, expenseTypes]);

  const handleSave = async () => {
    if (!selectedGateway) {
      toast.error("select payment method first");
      return;
    }
    const firstMethod = selectedGateway.payment_type_category.find(
      (m) => m.id == selectedAccount,
    );
    const selectedMethods = [
      ...paymentMethods.map(({ id, methodName, ...rest }) => rest),
      {
        payment_type_id: firstMethod.payment_type_id,
        payment_type_category_id: firstMethod.id,
        payment_amount: parseInt(payAmount),
      },
    ];

    const paidAmount = selectedMethods.reduce(
      (prev, curr) => prev + curr.payment_amount,
      0,
    );

    const payload = {
      ...formData,
      payment_method: selectedMethods,
      amount: paidAmount,
      paid_amount: paidAmount,
    };

    try {
      const res = await addExpense(payload).unwrap();
      if (res.success) {
        toast.success("Created Successfully");
        onClose();
      } else {
        toast.error("error occured");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="px-2">
      <div className="space-y-5 overflow-y-auto">
        {/* Expense Type */}
        <div className="space-y-2">
          <Label
            htmlFor="expense-type"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-gray-600" />
            {isExpenseRoute ? "Expense Type" : "Quick Payment Type"}
          </Label>
          <Select
            value={formData.expense_type_id}
            onValueChange={(value) => {
              handleInputChange("expense_type_id", value);
            }}
          >
            <SelectTrigger id="expense-type">
              <SelectValue
                placeholder={`Select ${
                  isExpenseRoute ? "expense type" : "quick payment type"
                }`}
              >
                {
                  expenseTypes?.data?.find(
                    (item) => item.id == formData.expense_type_id,
                  )?.expense_name
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {expenseTypes?.data && expenseTypes?.data?.length
                ? expenseTypes.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.expense_name}
                    </SelectItem>
                  ))
                : ""}
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="catogory_name"
            className="text-sm font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            Name
          </Label>
          <Input
            id="catogory_name"
            type="text"
            value={formData.catogory_name}
            onChange={(e) => handleInputChange("catogory_name", e.target.value)}
            placeholder="Enter expense name"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label
            htmlFor="transaction_date"
            className="text-sm font-medium flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-gray-600" />
            Date
          </Label>
          <Input
            id="transaction_date"
            type="date"
            value={formData.transaction_date}
            onChange={(e) =>
              handleInputChange("transaction_date", e.target.value)
            }
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter expense description (optional)"
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* payment methods */}
        <div>
          <PaymentMethods
            payAmount={payAmount}
            setPayAmount={setPayAmount}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            paymentMethods={paymentMethods}
            setPaymentMethods={setPaymentMethods}
            selectedGateway={selectedGateway}
            setSelectedGateway={setSelectedGateway}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 mt-3 border-t bg-gray-50 flex gap-3">
        <Button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save {isExpenseRoute ? "Expense" : "Quick Payment"}
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          className="flex-1 bg-transparent"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
