"use client";
import {
  useAddExpenseTypeMutation,
  useEditExpenseTypeMutation,
  useGetTransactionStatusesQuery,
} from "@/app/store/api/expenseApi";
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
import { FileText, Save, Tag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function EditCategoryUi({ expenseType, onClose }) {
  const pathname = usePathname();
  const isExpenseRoute = pathname.includes("expense");
  const [formData, setFormData] = useState({
    transaction_category: expenseType.transaction_category || "",
    expense_name: expenseType.expense_name || "",
    expense_description: expenseType.expense_description || "",
  });

  const { data: transactionStatues } = useGetTransactionStatusesQuery();
  const [editExpenseType] = useEditExpenseTypeMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      transaction_type_id: isExpenseRoute ? 1 : 0,
    };

    try {
      const res = await editExpenseType({
        id: expenseType.id,
        payload,
      }).unwrap();
      if (res.success) {
        toast.success("Updated Successfully");
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
        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="expense_name"
            className="text-sm font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            Name
          </Label>
          <Input
            id="expense_name"
            type="text"
            value={formData.expense_name}
            onChange={(e) => handleInputChange("expense_name", e.target.value)}
            placeholder="Name"
          />
        </div>

        {/* Expense Type */}
        <div className="space-y-2">
          <Label
            htmlFor="expense-type"
            className="text-sm font-medium flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-gray-600" />
            Expense Category
          </Label>
          <Select
            value={formData.transaction_category}
            onValueChange={(value) => {
              handleInputChange("transaction_category", value);
            }}
          >
            <SelectTrigger id="expense-type">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              {transactionStatues && transactionStatues?.length
                ? transactionStatues.map((item) => (
                    <SelectItem
                      key={item.transaction_status}
                      value={item.transaction_status}
                    >
                      {item.transaction_status}
                    </SelectItem>
                  ))
                : ""}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label
            htmlFor="expense_description"
            className="text-sm font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            Description
          </Label>
          <Textarea
            id="expense_description"
            value={formData.expense_description}
            onChange={(e) =>
              handleInputChange("expense_description", e.target.value)
            }
            placeholder="Enter expense description (optional)"
            className="min-h-[80px] resize-none"
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
          Save {isExpenseRoute ? "Expense" : "Quick Payment"} Category
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
