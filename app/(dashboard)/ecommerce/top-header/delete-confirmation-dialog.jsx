"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useTopbars from "@/apiHooks/hooks/useTopHeaderQuery";

export function DeleteConfirmDialog({ isOpen, onClose, id }) {
  const { deleteTopbar } = useTopbars();

  const handleDelete = async () => {
    try {
      await deleteTopbar.mutateAsync(id);
      toast.success("Topbar deleted successfully.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete topbar.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground mb-4">
          Are you sure you want to delete this topbar? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
