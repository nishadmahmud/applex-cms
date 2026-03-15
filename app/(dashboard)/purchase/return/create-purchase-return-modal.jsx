"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import {
  useGetPurchaseInvoicesQuery,
  useSearchPurchaseInvoiceMutation,
  useGetPurchasePaymentMethodsQuery,
  useSavePurchaseReturnMutation,
} from "@/app/store/api/purchaseReturnApi";
import StepSelectInvoice from "./step/step-select-invoice";
import StepReturnQty from "./step/step-return-qty";
import StepPayments from "./step/step-payments";

export default function CreatePurchaseReturnModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [payments, setPayments] = useState([
    { payment_type_id: null, payment_type_category_id: null, Amount: 0 },
  ]);

  const { data: invoicesList } = useGetPurchaseInvoicesQuery({
    page: 1,
    limit: 20,
  });
  const [searchInvoice] = useSearchPurchaseInvoiceMutation();
  const { data: paymentList } = useGetPurchasePaymentMethodsQuery();
  const [savePurchaseReturn, { isLoading: saving }] =
    useSavePurchaseReturnMutation();

  const invoices = invoicesList?.data?.data || [];
  const paymentsData = paymentList?.data?.data || [];

  const calcTotal = () =>
    returnData.reduce((sum, d) => sum + (d.return_unit_price * d.return_qty) , 0);

  const resetAll = () => {
    setStep(1);
    setSelectedInvoice(null);
    setSelectedProducts([]);
    setReturnData([]);
    setPayments([
      { payment_type_id: null, payment_type_category_id: null, Amount: 0 },
    ]);
  };

  const handleSave = async () => {
    const totalAmt = calcTotal();
    const mappedPayments = payments
      .filter((p) => p.payment_type_id && p.Amount > 0)
      .map((p) => {
        const m = paymentsData.find((x) => x.id === p.payment_type_id);
        const cat = m?.payment_type_category?.find(
          (c) => c.id === p.payment_type_category_id
        );
        return {
          methodName: m?.type_name,
          accountName: cat?.payment_category_name || "",
          account_number: cat?.account_number || "",
          payment_type_id: p.payment_type_id,
          payment_type_category_id: p.payment_type_category_id,
          Amount: p.Amount,
        };
      });

    const paySum = mappedPayments.reduce((a, b) => a + b.Amount, 0);
    if (paySum !== totalAmt) {
      toast.error("Payments must equal total return amount.");
      return;
    }

    const payload = {
      invoice_id: selectedInvoice.invoice_id,
      return_amount: totalAmt,
      return_qty: returnData.reduce((a, b) => a + b.return_qty, 0),
      payment_id: "",
      name: totalAmt.toString(),
      product: returnData.map((d) => ({
        product_id: d.product_id,
        details_id: d.details_id,
        imei: d.imei || null,
        return_qty: d.return_qty,
        return_unit_price: d.return_unit_price,
        discount:
          d.discount_type === "Percentage"
            ? Number(d.discount) / 100
            : Number(d.discount),
        return_amount: d.return_amount,
        return_stock_status: d.return_stock_status || 0,
      })),
      multiple_payment: mappedPayments,
    };

    try {
      const res = await savePurchaseReturn(payload).unwrap();
      if (res.success) {
        toast.success("Purchase Return created successfully!");
        onClose();
      } else toast.error("Failed to save purchase return.");
    } catch (err) {
      console.error(err);
      toast.error("Error saving purchase return.");
    }
  };

  useEffect(() => {
    if (!open) resetAll();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Add Purchase Return
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <StepSelectInvoice
            invoices={invoices}
            selectedInvoice={selectedInvoice}
            setSelectedInvoice={setSelectedInvoice}
            searchInvoice={searchInvoice}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            onClose={onClose}
            onNext={(mapped) => {
              setReturnData(mapped);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepReturnQty
            returnData={returnData}
            setReturnData={setReturnData}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepPayments
            payments={payments}
            setPayments={setPayments}
            paymentsData={paymentsData}
            saving={saving}
            calcTotal={calcTotal}
            onBack={() => setStep(2)}
            onDone={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
