"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSaveServiceMutation } from "@/app/store/api/servicesApi";
import { useGetProductsQuery } from "@/app/store/api/storeLedgerReportApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form Components
import BasicInfo from "./BasicInfo";
import ProductsTechnicians from "./ProductsTechnicians";
import Warranties from "./Warranties";
import FinancialsPayments from "./FinancialsPayments";

export default function CreateServicePage() {
    const router = useRouter();
    const [saveService, { isLoading }] = useSaveServiceMutation();

    const { data: productsRes } = useGetProductsQuery({ page: 1, limit: 1000 });
    const rawProductsList = productsRes?.data?.data || [];
    const productsList = Array.from(new Map(rawProductsList.map(p => [p.id, p])).values());

    const [formData, setFormData] = useState({
        customer_id: "",
        invoice_id: "",
        issue_description: "",
        status: "Pending",
        checking_description: "",
        service_type_id: "",
        attachment: null,
        product: [],
        payment_method: [],
        warranty: [],
        fees: 0,
        total: 0,
        paid_amount: 0,
        return_amount: 0,
        due_amount: 0,
        vat: 0,
        tax: 0,
        discount: 0,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.customer_id) throw new Error("Please select a Customer.");
            if (!formData.service_type_id) throw new Error("Please select a Service Type.");
            if (formData.product.length === 0) throw new Error("Please add at least one product to service.");

            const payload = new FormData();

            const appendFormData = (data, pKey) => {
                if (data instanceof File) {
                    payload.append(pKey, data);
                } else if (Array.isArray(data)) {
                    data.forEach((item, index) => {
                        appendFormData(item, `${pKey}[${index}]`);
                    });
                } else if (typeof data === "object" && data !== null) {
                    Object.entries(data).forEach(([key, value]) => {
                        appendFormData(value, `${pKey}[${key}]`);
                    });
                } else if (data !== null && data !== undefined && data !== "") {
                    payload.append(pKey, data);
                }
            };

            Object.entries(formData).forEach(([key, value]) => {
                appendFormData(value, key);
            });

            const res = await saveService(payload).unwrap();
            toast.success("Service record created successfully!");

            // Try to normalize the response shape and extract an invoice / service id.
            const payloadData = res?.data?.data || res?.data || res;
            const responseInvoiceId =
                payloadData?.invoice_id ||
                payloadData?.service_invoice_id ||
                payloadData?.id;
            const serviceId = payloadData?.service_id;

            // Also fall back to whatever invoice_id we sent (if your backend keeps it)
            const formInvoiceId = formData.invoice_id;

            const invoiceTarget =
                responseInvoiceId || serviceId || formInvoiceId || payloadData?.service_invoice_id;

            if (invoiceTarget) {
                router.push(`/invoice/${invoiceTarget}`);
            } else {
                router.push("/services/list");
            }
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Failed to create service.");
        }
    };

    return (
        <ProtectedRoute featureName="Service Management" optionName="Add Service">
            <div className="container mx-auto p-6 max-w-5xl space-y-6 mb-20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Register New Service</CardTitle>
                            <CardDescription>Fill out the primary details for the incoming service issue.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BasicInfo formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Products & Technicians</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProductsTechnicians formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Warranties</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Warranties formData={formData} setFormData={setFormData} products={productsList} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Financials & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FinancialsPayments formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 shadow-t sticky bottom-0 bg-white py-4 -mx-6 px-6 border-t mt-8 z-10 w-full">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="px-8" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Service"}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
