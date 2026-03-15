"use client";
import React, { useState, useEffect } from "react";
import useEmployees from "@/apiHooks/hooks/useEmployeesQuery";
import Modal from "@/app/utils/Modal";
import CustomPagination from "@/app/utils/CustomPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import DeleteConfirmation from "./delete‑confirmation";
import EmployeeForm from "./employee‑form";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EmployeePage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [deleteData, setDeleteData] = useState({
    open: false,
    id: null,
    name: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(keyword.trim()), 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, isLoading, createEmployee, updateEmployee, deleteEmployee } =
    useEmployees({ page, limit: 20, keyword: debounced });

  const employees = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.last_page || 1;
  const currentPage = meta?.current_page || page;

  // 🔹 Fetch all roles once, just like in your EmployeeForm
  const { data: roleList } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await api.get("/role-list"))?.data?.data || [],
  });

  const roleMap = roleList
    ? Object.fromEntries(roleList.map((r) => [r.id, r.name]))
    : {};

  const handleSubmit = (formData) => {
    if (selectedEmp)
      updateEmployee.mutate({ id: selectedEmp.id, payload: formData });
    else createEmployee.mutate(formData);
    setModalOpen(false);
    setSelectedEmp(null);
  };

  const handleDelete = () => {
    deleteEmployee.mutate(deleteData.id);
    setDeleteData({ open: false, id: null, name: "" });
  };

  return (
    <ProtectedRoute featureName={"HRM"} optionName={"Employee List"}>
      <div className="container mx-auto py-6">
        <Card className="shadow-sm border border-violet-100">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Employee Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employee..."
                  className="pl-8 w-60 focus:ring-2 focus:ring-violet-300"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  setSelectedEmp(null);
                  setModalOpen(true);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Employee
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : employees.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No employees found
              </p>
            ) : (
              <>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-violet-50 sticky top-0">
                      <tr className="text-left text-gray-600 font-medium">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Photo</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2 text-center">Status</th>
                        <th className="px-3 py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr
                          key={emp.id}
                          className="hover:bg-violet-50 border-b transition text-gray-700"
                        >
                          <td className="px-3 py-2">
                            {(currentPage - 1) * 10 + (index + 1)}
                          </td>
                          <td className="px-3 py-2">
                            <img
                              src={emp.emp_image || "/placeholder-user.jpg"}
                              alt="emp"
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                          </td>
                          <td className="px-3 py-2 font-medium">{emp.name}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {emp.email || "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {emp.mobile_number}
                          </td>
                          <td className="px-3 py-2">
                            {roleMap[emp.role_id] || "—"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                emp.status === "1"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {emp.status === "1" ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2 flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmp(emp);
                                setModalOpen(true);
                              }}
                              className="text-violet-600 border-violet-200 hover:bg-violet-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDeleteData({
                                  open: true,
                                  id: emp.id,
                                  name: emp.name,
                                })
                              }
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <CustomPagination
                      totalPage={totalPages}
                      currentPage={page}
                      setCurrentPage={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Modal
          title={selectedEmp ? "Edit Employee" : "Add Employee"}
          open={isModalOpen}
          onClose={setModalOpen}
          customDesignFor="employee_modal"
          content={
            <EmployeeForm
              onClose={() => setModalOpen(false)}
              initialData={selectedEmp}
              onSubmit={handleSubmit}
              isLoading={createEmployee.isLoading || updateEmployee.isLoading}
            />
          }
        />

        <DeleteConfirmation
          open={deleteData.open}
          name={deleteData.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteData({ open: false, id: null, name: "" })}
        />
      </div>
    </ProtectedRoute>
  );
}
