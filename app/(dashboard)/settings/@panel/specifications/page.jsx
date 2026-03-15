"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useGetSpecificationsQuery,
  useDeleteSpecificationMutation,
} from "@/app/store/api/specificationApi";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, Settings } from "lucide-react";
import SpecificationModal from "./SpecificationModal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setToken } from "@/app/store/authSlice";

export default function SpecificationsPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const [page, setPage] = useState(1);
  const [per_page] = useState(6);
  const [search] = useState("");
  const { data, isFetching } = useGetSpecificationsQuery(
    { per_page, page, search },
    { skip: status !== "authenticated" },
  );

  const [deleteSpecification] = useDeleteSpecificationMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const specifications = data?.data?.data || [];
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  const handleDelete = async (id) => {
    try {
      await deleteSpecification(id).unwrap();
      toast.success("Specification deleted successfully");
    } catch {
      toast.error("Failed to delete specification");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" /> Specifications
        </h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Specification
        </Button>
      </div>

      {/* === List Section === */}
      {isFetching ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading…
        </div>
      ) : specifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No specifications found.
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
            {specifications.map((spec) => (
              <Card
                key={spec.id}
                className="hover:shadow-lg transition-all border-gray-200 rounded-xl"
              >
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {spec.name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      {spec.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditData(spec);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setDeleteTarget(spec);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm border-t mt-2">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spec.specification_values.map((val) => (
                        <tr key={val.id} className="border-t hover:bg-gray-50">
                          <td className="p-2 font-semibold">{val.name}</td>
                          <td className="p-2">{val.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: lastPage }).map((_, idx) => {
                    const num = idx + 1;
                    const isActive = num === currentPage;
                    return (
                      <PaginationItem key={num}>
                        <PaginationLink
                          onClick={() => setPage(num)}
                          isActive={isActive}
                          className={isActive ? "bg-blue-600 text-white" : ""}
                        >
                          {num}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      className={
                        currentPage === lastPage
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* === Modals === */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editData ? "Edit Specification" : "New Specification"}
              </DialogTitle>
            </DialogHeader>
            <SpecificationModal
              onClose={() => setModalOpen(false)}
              editData={editData}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete <b>{deleteTarget?.name}</b>?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
