import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useGetProductsQuery } from "@/app/store/api/storeLedgerReportApi";
import { useGetTechniciansQuery } from "@/app/store/api/techniciansApi";

// Because shadcn limit multi-select by default, we'll use a simple multi-select or just standard Select.
// For MVP we can just use a generic native select for technicians or a simple array toggler.
import SelectMulti from "react-select";

export default function ProductsTechnicians({ formData, setFormData }) {
    const { data: productsRes } = useGetProductsQuery({ page: 1, limit: 1000 });
    const rawProducts = productsRes?.data?.data || [];
    const products = Array.from(new Map(rawProducts.map(p => [p.id, p])).values());

    const { data: techRes } = useGetTechniciansQuery();
    const rawTechnicians = techRes?.data || [];
    const technicians = Array.from(new Map(rawTechnicians.map(t => [t.id, t])).values());

    const techOptions = technicians.map(t => ({ label: t.name, value: t.id }));

    const addProductRow = () => {
        setFormData(prev => ({
            ...prev,
            product: [
                ...prev.product,
                { product_id: "", servicing_unit: 1, technician_ids: [] }
            ]
        }));
    };

    const removeProductRow = (index) => {
        setFormData(prev => ({
            ...prev,
            product: prev.product.filter((_, i) => i !== index)
        }));
    };

    const updateProductRow = (index, key, value) => {
        setFormData(prev => {
            const newProducts = [...prev.product];
            newProducts[index][key] = value;
            return { ...prev, product: newProducts };
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Serviced Products & assigned Technicians</h3>
                <Button onClick={addProductRow} variant="outline" size="sm" type="button">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            {formData.product.map((prod, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 border p-4 rounded-md relative bg-gray-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        onClick={() => removeProductRow(index)}
                        type="button"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="space-y-2 md:col-span-5">
                        <Label>Product</Label>
                        <SelectMulti
                            options={products.map(p => ({ label: p.name, value: p.id }))}
                            value={
                                prod.product_id
                                    ? { label: products.find(p => p.id.toString() === prod.product_id.toString())?.name || "", value: prod.product_id }
                                    : null
                            }
                            onChange={(selected) => updateProductRow(index, "product_id", selected ? selected.value.toString() : "")}
                            placeholder="Search & select product..."
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Servicing Unit(Qty)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={prod.servicing_unit}
                            onChange={(e) => updateProductRow(index, "servicing_unit", Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-5">
                        <Label>Assign Technicians</Label>
                        <SelectMulti
                            isMulti
                            options={techOptions}
                            value={techOptions.filter(opt => prod.technician_ids.includes(opt.value))}
                            onChange={(selected) => updateProductRow(index, "technician_ids", selected.map(s => s.value))}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
