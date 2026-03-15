"use client";
import React, { useState, useEffect } from "react";
import DepartmentForm from "./department-form";
import DeleteConfirmation from "./delete-confirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "@/app/utils/Modal";
import useDepartments from "@/apiHooks/hooks/useDepartmentsQuery";
import CustomPagination from "@/app/utils/CustomPagination";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DepartmentPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDep, setSelectedDep] = useState(null);
  const [deleteData, setDeleteData] = useState({
    open: false,
    id: null,
    name: "",
  });

  // 🔍 DEBOUNCE search
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchKey(keyword.trim());
      setPage(1); // reset to page 1 when user changes search
    }, 500); // <-- debounce delay (ms)
    return () => clearTimeout(delay);
  }, [keyword]);

  const { data, isLoading, createDept, updateDept, deleteDept } =
    useDepartments({
      page,
      limit: 10,
      keyword: searchKey,
    });

  const departments = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.last_page || 1;
  const currentPage = meta?.current_page || 1;

  const handleSubmit = (formData) => {
    if (selectedDep)
      updateDept.mutate({ id: selectedDep.id, payload: formData });
    else createDept.mutate(formData);
    setModalOpen(false);
    setSelectedDep(null);
  };

  const handleDelete = () => {
    deleteDept.mutate(deleteData.id);
    setDeleteData({ open: false, id: null, name: "" });
  };

  return (
    <ProtectedRoute featureName={"HRM"} optionName={"Department List"}>
      <div className="container mx-auto py-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Department Management
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search department..."
                  className="pl-8 w-60"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <Button
                onClick={() => {
                  setSelectedDep(null);
                  setModalOpen(true);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Department
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : departments.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No departments found
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-violet-50">
                      <tr className="text-left text-gray-600 font-medium">
                        <th className="px-4 py-2 border-b">#</th>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">Description</th>
                        <th className="px-4 py-2 border-b text-center">
                          Employees
                        </th>
                        <th className="px-4 py-2 border-b text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept, idx) => (
                        <tr
                          key={dept.id}
                          className="hover:bg-violet-50 border-b transition"
                        >
                          <td className="px-4 py-2">
                            {(currentPage - 1) * 10 + (idx + 1)}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-800">
                            {dept.name}
                          </td>
                          <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                            {dept.description || "---"}
                          </td>
                          <td className="px-4 py-2 text-center font-semibold text-violet-700">
                            {dept.employee_count}
                          </td>
                          <td className="px-4 py-2 text-center flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDep(dept);
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
                                  id: dept.id,
                                  name: dept.name,
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

                {/* ✅ Custom Pagination */}
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

        {/* ➕ Create/Edit Modal */}
        <Modal
          title={selectedDep ? "Edit Department" : "Add Department"}
          open={isModalOpen}
          onClose={setModalOpen}
          content={
            <DepartmentForm
              onClose={() => setModalOpen(false)}
              initialData={selectedDep}
              onSubmit={handleSubmit}
              isLoading={createDept.isLoading || updateDept.isLoading}
            />
          }
        />

        {/* ❌ Delete Confirmation */}
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
