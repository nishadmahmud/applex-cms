"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Modal from "@/app/utils/Modal";
import ServiceTypeForm from "./ServiceTypeForm";
import {
    useGetServiceTypesQuery,
    useDeleteServiceTypeMutation,
} from "@/app/store/api/serviceTypesApi";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ServiceTypesPage() {
    const { data: response, isLoading, refetch } = useGetServiceTypesQuery();
    const [deleteServiceType] = useDeleteServiceTypeMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    const serviceTypes = response?.data || response || [];

    const handleEdit = (item) => {
        setEditingType(item);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingType(null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service type?")) return;
        try {
            await deleteServiceType(id).unwrap();
            toast.success("Service type deleted");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete");
        }
    };

    return (
        <ProtectedRoute featureName="Service Management" optionName="Service Types">
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Service Types</CardTitle>
                            <Button onClick={handleAdd}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Type
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SL</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : serviceTypes?.length > 0 ? (
                                        serviceTypes.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.description || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 1 ? "default" : "secondary"}>
                                                        {item.status === 1 ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">No service types found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={editingType ? "Edit Service Type" : "Add Service Type"}
                    content={
                        <ServiceTypeForm
                            initialData={editingType}
                            onClose={() => setModalOpen(false)}
                        />
                    }
                />
            </div>
        </ProtectedRoute>
    );
}
