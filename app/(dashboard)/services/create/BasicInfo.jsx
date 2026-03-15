import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Modal from "@/app/utils/Modal";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetServiceTypesQuery } from "@/app/store/api/serviceTypesApi";
import { useGetCustomerListQuery } from "@/app/store/api/saleCustomerApi";

export default function BasicInfo({ formData, setFormData }) {
    const [customerModal, setCustomerModal] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: "",
        mobile_number: "",
        email: "",
        nid: "",
        address: "",
        is_member: 0,
    });
    const customerFormRef = useRef(null);

    const { data: serviceTypesRes } = useGetServiceTypesQuery();
    const serviceTypes = serviceTypesRes?.data || [];

    // Note: we fetch customers. In a real app this might be a searchable select
    const { data: customersRes } = useGetCustomerListQuery({ limit: 1000 });
    const customers = customersRes?.data?.data || [];

    const handleSelectChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewCustomerAdded = (data) => {
        setFormData((prev) => ({ ...prev, customer_id: data.customer_id.toString() }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Customer</Label>
                <div className="flex gap-2">
                    <Select value={formData.customer_id} onValueChange={(val) => handleSelectChange("customer_id", val)}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.mobile_number})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setCustomerModal(true)}
                        className="shrink-0 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Add New Customer"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={formData.service_type_id} onValueChange={(val) => handleSelectChange("service_type_id", val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {serviceTypes.map((st) => (
                            <SelectItem key={st.id} value={st.id.toString()}>{st.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Invoice ID</Label>
                <Input name="invoice_id" value={formData.invoice_id} onChange={handleChange} placeholder="Optional Invoice ID" />
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Issue Description</Label>
                <Textarea name="issue_description" value={formData.issue_description} onChange={handleChange} placeholder="Describe the issue..." />
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Checking Description</Label>
                <Textarea name="checking_description" value={formData.checking_description} onChange={handleChange} placeholder="Describe the initial checking..." />
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Attachment</Label>
                <Input type="file" onChange={(e) => setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }))} />
            </div>
            <Modal
                title={"Add New Customer"}
                onClose={setCustomerModal}
                open={customerModal}
                content={
                    <CustomerInfoForm
                        setCustomerModal={setCustomerModal}
                        formRef={customerFormRef}
                        formData={customerData}
                        setFormData={setCustomerData}
                        setExistingCustomerData={handleNewCustomerAdded}
                    />
                }
            />
        </div>
    );
}
