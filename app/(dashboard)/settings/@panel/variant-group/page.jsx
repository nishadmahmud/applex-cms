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
import { Loader2, Plus, Pencil, Trash2, Grid } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { setToken } from "@/app/store/authSlice";

import {
  useGetVariantGroupsQuery,
  useSaveVariantGroupMutation,
  useDeleteVariantGroupMutation,
} from "@/app/store/api/variantGroupApi";
import VariantGroupModal from "./VariantGroupModal";

export default function VariantGroupsPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, dispatch, session]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isFetching, error } = useGetVariantGroupsQuery(undefined, {
    skip: status !== "authenticated",
  });

  const [deleteVariantGroup] = useDeleteVariantGroupMutation();

  const handleDelete = async (id) => {
    try {
      await deleteVariantGroup(id).unwrap();
      toast.success("Variant group deleted successfully");
    } catch {
      toast.error("Failed to delete variant group");
    } finally {
      setConfirmOpen(false);
    }
  };

  const variantGroups = data || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Grid className="h-6 w-6 text-blue-600" />
          Variant Groups
        </h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Variant Group
        </Button>
      </div>

      {/* Main content */}
      {isFetching ? (
        <div className="flex justify-center items-center py-24 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading Variant Groups…
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          Failed to load variant groups.
        </div>
      ) : variantGroups.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No variant groups found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {variantGroups.map((vg) => (
            <Card
              key={vg.id}
              className="hover:shadow-lg transition-all border-gray-200 rounded-xl"
            >
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {vg.name}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {vg.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditData(vg);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setDeleteTarget(vg);
                      setConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400">
                  Created: {new Date(vg.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  Updated: {new Date(vg.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editData ? "Edit Variant Group" : "New Variant Group"}
              </DialogTitle>
            </DialogHeader>
            <VariantGroupModal
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
