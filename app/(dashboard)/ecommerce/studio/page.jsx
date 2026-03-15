"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Video, Loader2, Eye } from "lucide-react";
import {
  useStudioList,
  useDeleteStudio,
} from "@/apiHooks/hooks/useVendorsAndStudio";
import StudioModal from "./StudioModal";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import CustomPagination from "@/app/utils/CustomPagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function StudioPage() {
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingStudio, setEditingStudio] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // 👁 new: viewer state
  const [viewer, setViewer] = useState({ open: false, item: null });

  const { data, isLoading, isFetching } = useStudioList(page);
  const deleteStudio = useDeleteStudio();

  const handleDelete = (id) => setDeleteId(id);
  const handleConfirmDelete = async () => {
    try {
      const res = await deleteStudio.mutateAsync(deleteId);
      toast.success(res.message || "Studio deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          Studio Library
        </h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setEditingStudio(null);
            setOpenModal(true);
          }}
        >
          <Plus className="mr-2 w-4 h-4" /> Add Studio
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin w-5 h-5" />
            Loading...
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600 font-medium">
                <th className="p-3">Video</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Products</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.data?.length ? (
                data.data.data.map((studio) => (
                  <tr
                    key={studio.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <video
                        src={studio.video_link}
                        controls
                        className="w-32 h-20 rounded-md border"
                      />
                    </td>
                    <td className="p-3 capitalize font-medium">
                      {studio.vendor?.name || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {studio.products?.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {studio.description || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {/* 👁 view button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-emerald-50"
                          onClick={() =>
                            setViewer({ open: true, item: studio })
                          }
                        >
                          <Eye className="w-4 h-4 text-emerald-700" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingStudio(studio);
                            setOpenModal(true);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(studio.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 p-6 italic"
                  >
                    No studios found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {data?.data?.last_page > 1 && (
        <div className="flex justify-center pt-4">
          <CustomPagination
            totalPage={data.data.last_page}
            currentPage={page}
            setCurrentPage={setPage}
          />
        </div>
      )}

      {/* Modals */}
      {openModal && (
        <StudioModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingStudio(null);
          }}
          studio={editingStudio}
        />
      )}

      {deleteId && (
        <ConfirmDeleteDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isFetching && (
        <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
          <Loader2 className="w-3 h-3 animate-spin" /> refreshing...
        </div>
      )}

      {/* 👁 Viewer Dialog */}
      {viewer.open && viewer.item && (
        <Dialog
          open={viewer.open}
          onOpenChange={(v) => setViewer({ open: v, item: viewer.item })}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Video className="w-4 h-4 text-blue-600" />
                Studio Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <video
                src={viewer.item.video_link}
                controls
                className="w-full max-h-[480px] rounded-md border"
              />

              <div>
                <p className="font-semibold text-gray-700">
                  Vendor:&nbsp;
                  <span className="font-normal">
                    {viewer.item.vendor?.name || "-"}
                  </span>
                </p>
                <p className="font-semibold text-gray-700 mt-2">
                  Description:&nbsp;
                  <span className="font-normal">
                    {viewer.item.description || "No description"}
                  </span>
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-gray-700 mb-1">Products:</p>
                  <div className="flex flex-wrap gap-2">
                    {viewer.item.products?.length ? (
                      viewer.item.products.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                        >
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        No products found
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
