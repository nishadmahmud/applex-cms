import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    useCreateServiceTypeMutation,
    useUpdateServiceTypeMutation,
} from "@/app/store/api/serviceTypesApi";
import { toast } from "sonner";

export default function ServiceTypeForm({ initialData = null, onClose }) {
    const [createServiceType, { isLoading: isCreating }] = useCreateServiceTypeMutation();
    const [updateServiceType, { isLoading: isUpdating }] = useUpdateServiceTypeMutation();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: 1, // 1 active, 0 inactive
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData?.name || "",
                description: initialData?.description || "",
                status: initialData?.status ?? 1,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (initialData?.id) {
                await updateServiceType({ id: initialData.id, ...formData }).unwrap();
                toast.success("Service Type updated successfully");
            } else {
                await createServiceType(formData).unwrap();
                toast.success("Service Type created successfully");
            }
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Something went wrong");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                    id="name"
                    placeholder="Service Type Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Service Type Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Switch
                    id="status"
                    checked={formData.status === 1}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 1 : 0 })}
                />
                <Label htmlFor="status">Active Status</Label>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? "Saving..." : initialData ? "Update" : "Save"}
                </Button>
            </div>
        </form>
    );
}
