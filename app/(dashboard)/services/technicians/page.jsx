"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2, User } from "lucide-react";
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
import Modal from "@/app/utils/Modal";
import TechnicianForm from "./TechnicianForm";
import {
    useGetTechniciansQuery,
    useDeleteTechnicianMutation,
} from "@/app/store/api/techniciansApi";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TechniciansPage() {
    const { data: response, isLoading } = useGetTechniciansQuery();
    const [deleteTechnician] = useDeleteTechnicianMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTech, setEditingTech] = useState(null);

    const technicians = response?.data || response || [];

    const handleEdit = (item) => {
        setEditingTech(item);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingTech(null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this technician?")) return;
        try {
            await deleteTechnician(id).unwrap();
            toast.success("Technician deleted");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete");
        }
    };

    return (
        <ProtectedRoute featureName="Service Management" optionName="Technicians">
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">Technicians</CardTitle>
                            <Button onClick={handleAdd}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Technician
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SL</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Salary</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                        </TableRow>
                                    ) : technicians?.length > 0 ? (
                                        technicians.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-10 h-10 rounded-full object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
                                                            <User size={20} />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.number || "-"}</TableCell>
                                                <TableCell>{item.email || "-"}</TableCell>
                                                <TableCell>{item.salary ? `${item.salary} BDT` : "-"}</TableCell>
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
                                            <TableCell colSpan={7} className="text-center">No technicians found.</TableCell>
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
                    title={editingTech ? "Edit Technician" : "Add Technician"}
                    content={
                        <TechnicianForm
                            initialData={editingTech}
                            onClose={() => setModalOpen(false)}
                        />
                    }
                />
            </div>
        </ProtectedRoute>
    );
}
