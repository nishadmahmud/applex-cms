"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUpdateServiceMutation, useGetServiceDetailsQuery } from "@/app/store/api/servicesApi";
import { useGetProductsQuery } from "@/app/store/api/storeLedgerReportApi";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Form Components (same as create)
import BasicInfo from "../../create/BasicInfo";
import ProductsTechnicians from "../../create/ProductsTechnicians";
import Warranties from "../../create/Warranties";
import FinancialsPayments from "../../create/FinancialsPayments";

export default function EditServicePage() {
    const router = useRouter();
    const params = useParams();
    const serviceInvoiceId = params?.id;

    const { data: detailsRes, isLoading: loadingDetails } = useGetServiceDetailsQuery(serviceInvoiceId, {
        skip: !serviceInvoiceId,
    });

    const [updateService, { isLoading }] = useUpdateServiceMutation();
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

    // Prefill form from fetched details
    useEffect(() => {
        const d = detailsRes?.data;
        if (!d) return;

        setFormData({
            customer_id: d.customer_id || "",
            invoice_id: d.invoice_id || "",
            issue_description: d.issue_description || "",
            status: d.status || "Pending",
            checking_description: d.checking_description || "",
            service_type_id: d.service_type_id || "",
            attachment: null, // can't re-populate file inputs
            product: (d.service_products || []).map(p => ({
                product_id: p.product_id,
                servicing_unit: p.servicing_unit,
                technician_ids: (p.technicians || []).map(t => t.id),
            })),
            payment_method: (d.service_payments || []).map(pm => ({
                payment_type_id: pm.payment_type_id,
                payment_type_category_id: pm.payment_type_category_id,
                payment_amount: pm.payment_amount,
                reference: pm.reference || "",
            })),
            warranty: (d.service_warranties || []).map(w => ({
                product_id: w.product_id,
                warranty_id: w.warranty_id,
                default_warranties_count: w.default_warranties_count,
            })),
            fees: d.fees || 0,
            total: d.total || 0,
            paid_amount: d.paid_amount || 0,
            return_amount: d.return_amount || 0,
            due_amount: d.due_amount || 0,
            vat: d.vat || 0,
            tax: d.tax || 0,
            discount: d.discount || 0,
        });
    }, [detailsRes]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.customer_id) throw new Error("Please select a Customer.");
            if (!formData.service_type_id) throw new Error("Please select a Service Type.");
            if (formData.product.length === 0) throw new Error("Please add at least one product.");

            const payload = new FormData();
            payload.append("service_invoice_id", serviceInvoiceId);

            const appendFormData = (data, pKey) => {
                if (data instanceof File) {
                    payload.append(pKey, data);
                } else if (Array.isArray(data)) {
                    data.forEach((item, index) => appendFormData(item, `${pKey}[${index}]`));
                } else if (typeof data === "object" && data !== null) {
                    Object.entries(data).forEach(([key, value]) => appendFormData(value, `${pKey}[${key}]`));
                } else if (data !== null && data !== undefined && data !== "") {
                    payload.append(pKey, data);
                }
            };

            Object.entries(formData).forEach(([key, value]) => appendFormData(value, key));

            await updateService(payload).unwrap();
            toast.success("Service updated successfully!");
            router.push("/services/list");
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "Failed to update service.");
        }
    };

    if (loadingDetails) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <ProtectedRoute featureName="Service Management" optionName="Add Service">
            <div className="container mx-auto p-6 max-w-5xl space-y-6 mb-20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Edit Service</CardTitle>
                            <CardDescription>Update the service record for <strong>{serviceInvoiceId}</strong>.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BasicInfo formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-xl font-bold">Products & Technicians</CardTitle></CardHeader>
                        <CardContent>
                            <ProductsTechnicians formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-xl font-bold">Warranties</CardTitle></CardHeader>
                        <CardContent>
                            <Warranties formData={formData} setFormData={setFormData} products={productsList} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-xl font-bold">Financials & Payments</CardTitle></CardHeader>
                        <CardContent>
                            <FinancialsPayments formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 shadow-t sticky bottom-0 bg-white py-4 -mx-6 px-6 border-t mt-8 z-10 w-full">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" className="px-8" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Service"}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
