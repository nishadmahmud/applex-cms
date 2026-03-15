"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import useFooter from "@/apiHooks/hooks/useFooterQuery";

export default function DeleteConfirmationModal({ open, onClose, footer }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteFooter } = useFooter();

  const handleDelete = async () => {
    if (!footer) return;

    setIsDeleting(true);

    try {
      await deleteFooter.mutateAsync(footer.id);
      toast.success("Footer deleted successfully");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete footer");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!footer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Footer</DialogTitle>
              <DialogDescription className="text-pretty">
                Are you sure you want to delete this footer? This action cannot
                be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Footer Details */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="font-medium text-balance">{footer.title}</div>
            {footer.description && (
              <div className="text-sm text-muted-foreground text-pretty">
                {footer.description}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {footer.nav_items?.length || 0} navigation items
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete Footer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
