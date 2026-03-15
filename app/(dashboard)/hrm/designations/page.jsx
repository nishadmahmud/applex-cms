"use client";
import React, { useState, useEffect } from "react";
import DesignationForm from "./designation-form";
import DeleteConfirmation from "./delete-confirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "@/app/utils/Modal";
import useDesignations from "@/apiHooks/hooks/useDesignationsQuery";
import CustomPagination from "@/app/utils/CustomPagination";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DesignationPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [deleteData, setDeleteData] = useState({
    open: false,
    id: null,
    name: "",
  });

  // 🔍 Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchKey(keyword.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [keyword]);

  // 📦 React Query
  const {
    data,
    isLoading,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  } = useDesignations({ page, limit: 10, keyword: searchKey });

  const designations = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta?.last_page || 1;
  const currentPage = meta?.current_page || 1;

  const handleSubmit = (formData) => {
    if (selectedDesignation)
      updateDesignation.mutate({
        id: selectedDesignation.id,
        payload: formData,
      });
    else createDesignation.mutate(formData);
    setModalOpen(false);
    setSelectedDesignation(null);
  };

  const handleDelete = () => {
    deleteDesignation.mutate(deleteData.id);
    setDeleteData({ open: false, id: null, name: "" });
  };

  return (
    <ProtectedRoute featureName={"HRM"} optionName={"Designation List"}>
      <div className="container mx-auto py-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Designation Management
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search designation..."
                  className="pl-8 w-60"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <Button
                onClick={() => {
                  setSelectedDesignation(null);
                  setModalOpen(true);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Designation
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            ) : designations.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                No designations found
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
                          Department
                        </th>
                        <th className="px-4 py-2 border-b text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {designations.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-violet-50 border-b transition"
                        >
                          <td className="px-4 py-2">
                            {(currentPage - 1) * 10 + (idx + 1)}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-800">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                            {item.description || "---"}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-700">
                            {item.department_id || "-"}
                          </td>
                          <td className="px-4 py-2 text-center flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDesignation(item);
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
                                  id: item.id,
                                  name: item.name,
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

                {/* ✅ Pagination */}
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
          title={selectedDesignation ? "Edit Designation" : "Add Designation"}
          open={isModalOpen}
          onClose={setModalOpen}
          content={
            <DesignationForm
              onClose={() => setModalOpen(false)}
              initialData={selectedDesignation}
              onSubmit={handleSubmit}
              isLoading={
                createDesignation.isLoading || updateDesignation.isLoading
              }
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
