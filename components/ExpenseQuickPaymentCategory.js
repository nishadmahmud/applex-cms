"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Modal from "@/app/utils/Modal";
import EditDetailsUi from "@/app/(dashboard)/expense/list/EditDetailsUi";
import { confirmationToast } from "@/app/(dashboard)/products/ConfirmationToast";
import { useDeleteExpenseTypeMutation } from "@/app/store/api/expenseApi";
import { toast } from "sonner";
import ViewCategoryUi from "@/app/(dashboard)/expense/categories/ViewCategoryUi";
import AddCategoryUi from "@/app/(dashboard)/expense/categories/AddCategoryUi";
import EditCategoryUi from "@/app/(dashboard)/expense/categories/EditCategoryUi";
import ExpenseQuickPaymentSkeleton from "./ExpenseQuickPaymentSkeleton";

export default function ExpenseQuickPaymentCategory({
  list,
  isLoading,
  type,
  isExpense,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState({});
  const [editModal, setEditModal] = useState({});
  const [createModal, setCreateModal] = useState(false);

  const [deleteExpenseType] = useDeleteExpenseTypeMutation();

  const getCategoryColor = (category) => {
    const colors = {
      Snackas: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      Lunch: "bg-green-100 text-green-800 hover:bg-green-200",
      Tea: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const handleViewModal = (id) => {
    setViewModal((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleEditModal = (id) => {
    setEditModal((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleDelete = async (id) => {
    confirmationToast("Delete it ?", {
      action: {
        label: "Yes",
        onClick: async () => {
          try {
            toast.loading("Deleting expense...");
            const res = await deleteExpenseType({ id }).unwrap();
            if (res.success) {
              toast.dismiss();
              toast.success("expense deleted successfully!");
            } else {
              toast.dismiss();
              toast.error(res.data.message);
            }
          } catch (error) {
            console.error("Delete failed:", error);
            toast.dismiss();
            toast.error("Failed to delete expense");
          }
        },
      },
      cancel: {
        label: "No",
        onClick: () => {
          toast.info("Delete cancelled");
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{type} List</CardTitle>
              <Button
                onClick={() => setCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {type}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Expense Table Card */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !list ? (
                  <ExpenseQuickPaymentSkeleton />
                ) : list && list?.length ? (
                  list.map((expense, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            #{expense.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(expense.expense_name)}
                        >
                          {expense.expense_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {expense.transaction_category}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {expense.expense_description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleViewModal(expense.id)}
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditModal(expense.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(expense.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Modal
                          open={viewModal[expense.id]}
                          onClose={() =>
                            setViewModal((prev) => ({
                              ...prev,
                              [expense.id]: false,
                            }))
                          }
                          title={"Details"}
                          content={<ViewCategoryUi selectedExpense={expense} />}
                        />

                        <Modal
                          open={editModal[expense.id]}
                          onClose={() =>
                            setEditModal((prev) => ({
                              ...prev,
                              [expense.id]: false,
                            }))
                          }
                          title={"Edit Expense Category"}
                          content={
                            <EditCategoryUi
                              onClose={() =>
                                setEditModal((prev) => ({
                                  ...prev,
                                  [expense.id]: false,
                                }))
                              }
                              expenseType={expense}
                            />
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="py-2">
                    <TableCell>No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Modal
          open={createModal}
          title={`Add ${isExpense ? "Expense" : "Quick Payment"} Category`}
          onClose={() => setCreateModal(false)}
          content={<AddCategoryUi onClose={() => setCreateModal(false)} />}
        />
      </div>
    </div>
  );
}
