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
  useGetSizeChartsQuery,
  useDeleteSizeChartMutation,
} from "@/app/store/api/sizeChartApi";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, Ruler } from "lucide-react";
import SizeChartModal from "./SizeChartModal";
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

export default function SizeChartsPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page] = useState(6); // default items per page
  const { data, isFetching } = useGetSizeChartsQuery(
    {
      search,
      per_page,
      page,
    },
    { skip: status !== "authenticated" },
  );
  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);
  const [deleteSizeChart] = useDeleteSizeChartMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const charts = data?.data?.data || [];
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  const handleDelete = async (id) => {
    try {
      await deleteSizeChart(id).unwrap();
      toast.success("Deleted successfully!");
    } catch {
      toast.error("Failed to delete size chart.");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Ruler className="h-6 w-6 text-blue-600" /> Size Charts
        </h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Size Chart
        </Button>
      </div>

      {/* === List Section === */}
      {isFetching ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading…
        </div>
      ) : charts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No size charts found.
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
            {charts.map((chart) => (
              <Card
                key={chart.id}
                className="hover:shadow-lg transition-all border-gray-200 rounded-xl"
              >
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {chart.name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      {chart.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditData(chart);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setDeleteTarget(chart);
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
                        <th className="p-2 text-left">Size</th>
                        <th className="p-2 text-center">Chest</th>
                        <th className="p-2 text-center">Waist</th>
                        <th className="p-2 text-center">Hip</th>
                        <th className="p-2 text-center">Length</th>
                        <th className="p-2 text-center">Shoulder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.size_chart_values.map((sz) => (
                        <tr key={sz.id} className="border-t">
                          <td className="p-2 font-semibold">{sz.size_label}</td>
                          <td className="p-2 text-center">{sz.chest}</td>
                          <td className="p-2 text-center">{sz.waist}</td>
                          <td className="p-2 text-center">{sz.hip}</td>
                          <td className="p-2 text-center">{sz.length}</td>
                          <td className="p-2 text-center">{sz.shoulder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* === Pagination (ShadCN) === */}
          {lastPage > 1 && (
            <div className="flex justify-center mt-10">
              <Pagination>
                <PaginationContent>
                  {/* Previous */}
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

                  {/* Numbers */}
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

                  {/* Next */}
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
                {editData ? "Edit Size Chart" : "New Size Chart"}
              </DialogTitle>
            </DialogHeader>
            <SizeChartModal
              onClose={() => setModalOpen(false)}
              editData={editData}
            />
          </DialogContent>
        </Dialog>
      )}

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
