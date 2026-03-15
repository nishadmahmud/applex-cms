import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Download, Printer, Tag } from "lucide-react";
import React from "react";

export default function ViewCategoryUi({ selectedExpense }) {
  return (
    <div>
      <div className="px-6 py-4 space-y-5  overflow-y-auto">
        {/* Expense Name Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Expense Category Name</p>
              <p className=" text-orange-600">{selectedExpense.expense_name}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Amount Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Transaction Category</p>
              <p className="text-xl font-bold text-green-600">
                {selectedExpense.transaction_category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}
