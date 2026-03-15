import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  Download,
  FileText,
  Printer,
  Tag,
} from "lucide-react";
import React from "react";

export default function ViewDetailsUi({ selectedExpense }) {
  return (
    <div>
      <div className="px-6 py-4 space-y-5  overflow-y-auto">
        {/* Date Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">
                {selectedExpense.transaction_date}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Expense Name Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Expense Name</p>
              <p className=" text-orange-600">
                {selectedExpense.catogory_name}
              </p>
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
              <p className="text-xs text-gray-600">Transaction Amount</p>
              <p className="text-xl font-bold text-green-600">
                ৳{selectedExpense.amount}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Description Section */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-2">Description</p>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] border border-dashed border-gray-200">
              <p className="text-gray-500 italic text-sm">
                {selectedExpense.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Total Expense</p>
            <p className="text-2xl font-bold text-blue-600">
              ৳{selectedExpense.amount}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Recorded on {selectedExpense.date}
            </p>
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
