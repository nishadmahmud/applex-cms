"use client";
import {
  useDueDiscountMutation,
  useSaveAdvanceDueMutation,
  useUpdateDueCollectionMutation,
} from "@/app/store/api/dueInvoiceList";
import PaymentMethods from "@/components/PaymentMethods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function BalanceActions({ party, dueList, customer_id }) {
  console.log(dueList);
  const [expandedSection, setExpandedSection] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payAmount, setPayAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedGateway, setSelectedGateway] = useState(null);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [selectedDiscountInvoice, setSelectedDiscountInvoice] = useState("");

  // rtk data & mutations
  const [updateDueCollection] = useUpdateDueCollectionMutation();
  const [saveAdvanceDue] = useSaveAdvanceDueMutation();
  const [dueDiscount] = useDueDiscountMutation();

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // console.log(paymentMethods)

  const totalDueSum = Array.isArray(dueList)
    ? dueList.reduce((sum, item) => sum + (Number(item?.total_due) || 0), 0)
    : 0;

  const dueAmount = selectedInvoice
    ? party
      ? dueList.find((item) => item.purchase_invoice_id === selectedInvoice)
          ?.total_due
      : dueList.find((item) => item.sale_invoice_id === selectedInvoice)
          ?.total_due
    : totalDueSum;

  const handleDueSubmission = async () => {
    // if (!selectedInvoice) {
    //   toast.error("please select invoice first!");
    //   return;
    // }

    const firstMethod = selectedGateway.payment_type_category.find(
      (m) => m.id == selectedAccount
    );
    const selectedMethods = [
      ...paymentMethods.map(({ id, methodName, ...rest }) => rest),
      {
        payment_type_id: firstMethod.payment_type_id,
        payment_type_category_id: firstMethod.id,
        payment_amount: payAmount,
      },
    ];
    const paidAmount = selectedMethods.reduce(
      (prev, curr) => prev + curr.payment_amount,
      0
    );

    const dueSchema = !party
      ? {
          previous_due: dueList.find(
            (item) => item.sale_invoice_id === selectedInvoice
          )?.total_due,
          paid_amount: paidAmount,
          payment_method: selectedMethods,
          sale_invoice_id: selectedInvoice,
          purchase_invoice_id: selectedInvoice,
          exporter_invoice_id: selectedInvoice,
          carrier_invoice_id: selectedInvoice,
          wholesale_invoice_id: selectedInvoice,
          custom_date: date,
          customer_id: customer_id,
        }
      : {
          previous_due: dueList.find(
            (item) => item.sale_invoice_id === selectedInvoice
          )?.total_due,
          paid_amount: paidAmount,
          payment_method: selectedMethods,
          sale_invoice_id: selectedInvoice,
          purchase_invoice_id: selectedInvoice,
          exporter_invoice_id: selectedInvoice,
          carrier_invoice_id: selectedInvoice,
          wholesale_invoice_id: selectedInvoice,
          custom_date: date,
          vendor_id: customer_id,
        };

    const res = await updateDueCollection(dueSchema).unwrap();

    if (res.success) {
      toast.success(res.message);
      setSelectedInvoice("");
      setPayAmount("");
      setPaymentMethods([]);
    } else {
      toast.error("error occured try again");
    }
  };

  const handleAdvanceDue = async () => {
    const payload = {
      adv_amount: parseInt(balanceAmount),
      customer_id: parseInt(customer_id),
    };
    const res = await saveAdvanceDue(payload)?.unwrap();
    if (res.success) {
      toast.success("Advance Due Added Successfully");
    } else {
      toast.error("error occured try again");
    }
  };

  const handleDiscount = async () => {
    if (!selectedDiscountInvoice) {
      toast.error("please select invoice first!");
      return;
    }
    const payload = {
      due: "customer",
      invoice_id: selectedDiscountInvoice,
      discount_amount: discountAmount,
    };
    const res = await dueDiscount(payload)?.unwrap();
    if (res.success) {
      toast.success(res.message);
      setDiscountAmount("");
      setSelectedDiscountInvoice("");
    } else {
      toast.error("error occured try again");
    }
  };

  return (
    <div className="space-y-3">
      {/* Opening Balance Section */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-between bg-transparent"
          onClick={() => toggleSection("balance")}
        >
          <span>Opening Balance</span>
          {expandedSection === "balance" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {expandedSection === "balance" && (
          <div className="p-3 bg-[#EFF6FF] rounded-md space-y-3">
            <div>
              <Label htmlFor="balance-amount">Amount</Label>
              <Input
                id="balance-amount"
                type="text"
                placeholder="Enter amount"
                value={isNaN(balanceAmount) ? "" : balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAdvanceDue}
                size="sm"
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                Add Due
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add Paid
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pay Due Section */}
      <div className="space-y-2">
        <Button
          className="w-full justify-between bg-blue-600 hover:bg-blue-700"
          onClick={() => toggleSection("pay")}
        >
          <span>Pay Due</span>
          {expandedSection === "pay" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {expandedSection === "pay" && (
          <div className="p-3 bg-blue-50 rounded-md space-y-4">
            {/* Total Due */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Total Due</Label>
              <span className="text-lg font-semibold text-red-600">
                {dueAmount} BDT
              </span>
            </div>

            {/* Invoice ID */}
            <div>
              <Label htmlFor="invoice-id">Invoice ID</Label>
              <select
                value={selectedInvoice}
                onChange={(e) => setSelectedInvoice(e.target.value)}
                id="invoice-id"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Select Invoice ID</option>
                {dueList && dueList?.length ? (
                  dueList.map((item) => (
                    <option
                      key={
                        party ? item.purchase_invoice_id : item.sale_invoice_id
                      }
                      value={
                        party ? item.purchase_invoice_id : item.sale_invoice_id
                      }
                    >
                      {party ? item.purchase_invoice_id : item.sale_invoice_id}{" "}
                      (Total Due : {item.total_due})
                    </option>
                  ))
                ) : (
                  <option value="">No Option Available</option>
                )}
              </select>
            </div>

            {/* Transaction Date */}
            <div>
              <Label htmlFor="transaction-date">Transaction Date</Label>
              <Input
                value={date}
                id="transaction-date"
                type="date"
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Payment Section */}
            <div className="space-y-3 pt-2">
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

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDueSubmission}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpandedSection(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Due Discount Section */}
      <div className="space-y-2">
        <Button
          className="w-full justify-between bg-blue-600 hover:bg-blue-700"
          onClick={() => toggleSection("discount")}
        >
          <span>Due Discount</span>
          {expandedSection === "discount" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {expandedSection === "discount" && (
          <div className="p-3 bg-blue-50 rounded-md space-y-3">
            {/* Invoice ID */}
            <div>
              <Label htmlFor="invoice-id">Invoice ID</Label>
              <select
                value={selectedDiscountInvoice}
                onChange={(e) => setSelectedDiscountInvoice(e.target.value)}
                id="invoice-id"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="">Select Invoice ID</option>
                {dueList && dueList?.length ? (
                  dueList.map((item) => (
                    <option
                      key={item.sale_invoice_id}
                      value={item.sale_invoice_id}
                    >
                      {item.sale_invoice_id} (Total Due : {item.total_due} BDT)
                    </option>
                  ))
                ) : (
                  <option value="">No Option Available</option>
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="discount-amount">Discount Amount</Label>
              <Input
                id="discount-amount"
                type="text"
                placeholder="Enter discount amount"
                value={isNaN(discountAmount) ? "" : discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDiscount}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Apply Discount
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpandedSection(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
