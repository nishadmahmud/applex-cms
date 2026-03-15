"use client";

import { React, useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 1. Import useSession
import { toast } from "sonner";
// import {
//   useGetTagsQuery,
//   useDeleteTagMutation,
// } from "@/redux/services/tagsApi"; // Adjust the import path as necessary

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Trash2,
  Pencil,
  PlusCircle,
  Frown,
  ShieldAlert,
} from "lucide-react";
import { useDeleteTagMutation, useGetTagsQuery } from "@/app/store/api/tagsApi";
import TagsForm from "./tags-form";

const TagsPage = () => {
  // 2. Auth Status Check
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  // --- RTK Query Hooks (Conditional Fetching) ---
  const {
    data: tagsResponse,
    isLoading: isTagsLoading,
    isError: isTagsError,
    refetch,
  } = useGetTagsQuery(undefined, {
    skip: !isAuthenticated, // Skip query if not authenticated
  });

  const tags = tagsResponse ? tagsResponse.data : [];
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  // --- Deletion Handlers ---

  const openDeleteDialog = (tag) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setTagToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag(tagToDelete.id).unwrap();
      toast.success(`Tag "${tagToDelete.name}" deleted successfully!`);
      closeDeleteDialog();
    } catch (err) {
      console.error("Failed to delete tag:", err);
      // More specific error handling based on API response
      toast.error(
        `Failed to delete tag. ${
          err.data?.message || err.error || "Server Error"
        }`
      );
    }
  };

  // --- Form Handlers (Add/Edit) ---

  const openAddForm = () => {
    setEditingTag(null);
    setIsFormDialogOpen(true);
  };

  const openEditForm = (tag) => {
    setEditingTag(tag);
    setIsFormDialogOpen(true);
  };

  const closeFormDialog = () => {
    setEditingTag(null);
    setIsFormDialogOpen(false);
  };

  // --- Render Status ---

  if (status === "loading" || (isTagsLoading && isAuthenticated)) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">
          {status === "loading"
            ? "Checking Authentication..."
            : "Loading Tags..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-red-50/50 border border-red-200 rounded-lg p-4">
        <ShieldAlert className="h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-xl font-semibold text-red-600">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-600">
          Please log in to manage product tags.
        </p>
      </div>
    );
  }

  if (isTagsError) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-red-50/50 border border-red-200 rounded-lg p-4">
        <Frown className="h-8 w-8 text-red-500 mb-2" />
        <h3 className="text-xl font-semibold text-red-600">
          Error Fetching Tags
        </h3>
        <p className="text-sm text-gray-600">
          A network or server error occurred.
        </p>
        <Button onClick={refetch} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          Product Tags Management
        </h1>
        <Button onClick={openAddForm} className="shadow-lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Tags
        </Button>
      </div>

      {tags && tags.length > 0 ? (
        <div className="border rounded-lg overflow-hidden shadow-xl bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Tag Name</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag, index) => (
                // Assuming each tag object has an 'id' and 'name' property
                <TableRow
                  key={tag.id}
                  className="hover:bg-amber-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold">{tag.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit Tag"
                      onClick={() => openEditForm(tag)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete Tag"
                      onClick={() => openDeleteDialog(tag)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <Frown className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No Tags Found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new product tag.
          </p>
          <div className="mt-6">
            <Button onClick={openAddForm} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create First Tag
            </Button>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Dialog --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete the tag{" "}
              <span className="font-bold">{tagToDelete?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? "Deleting..." : "Delete Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Add/Update Form Dialog --- */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? `Edit Tag: ${editingTag.name}` : "Create New Tags"}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Update the name of the existing tag."
                : "Enter one or more tag names (separated by new lines or commas) to create them."}
            </DialogDescription>
          </DialogHeader>
          <TagsForm tag={editingTag} onClose={closeFormDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagsPage;
