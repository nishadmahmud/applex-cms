import React from "react";
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
import { Plus, Trash2 } from "lucide-react";
import { useGetWarrantyQuery } from "@/app/store/api/warrantyApi";

export default function Warranties({ formData, setFormData, products }) {
    const { data: warrantiesRes } = useGetWarrantyQuery({ page: 1, limit: 1000 });
    const warranties = warrantiesRes?.data || [];

    const addWarrantyRow = () => {
        setFormData((prev) => ({
            ...prev,
            warranty: [
                ...prev.warranty,
                { product_id: "", warranty_id: "", default_warranties_count: 0 },
            ],
        }));
    };

    const removeWarrantyRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            warranty: prev.warranty.filter((_, i) => i !== index),
        }));
    };

    const updateWarrantyRow = (index, key, value) => {
        setFormData((prev) => {
            const newWarranties = [...prev.warranty];
            newWarranties[index][key] = value;
            return { ...prev, warranty: newWarranties };
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Service Warranties</h3>
                <Button onClick={addWarrantyRow} variant="outline" size="sm" type="button">
                    <Plus className="w-4 h-4 mr-2" /> Add Warranty
                </Button>
            </div>

            {formData.warranty.map((warr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-md relative bg-gray-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeWarrantyRow(index)}
                        type="button"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="space-y-2 md:col-span-5">
                        <Label>Product</Label>
                        <Select
                            value={warr.product_id?.toString() || ""}
                            onValueChange={(val) => updateWarrantyRow(index, "product_id", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-4">
                        <Label>Warranty Type</Label>
                        <Select
                            value={warr.warranty_id?.toString() || ""}
                            onValueChange={(val) => updateWarrantyRow(index, "warranty_id", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Warranty" />
                            </SelectTrigger>
                            <SelectContent>
                                {warranties.map((w) => (
                                    <SelectItem key={w.id} value={w.id.toString()}>
                                        {w.name} ({w.duration} days)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Duration Count (Days)</Label>
                        <Input
                            type="number"
                            min="0"
                            value={warr.default_warranties_count}
                            onChange={(e) => updateWarrantyRow(index, "default_warranties_count", Number(e.target.value))}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
