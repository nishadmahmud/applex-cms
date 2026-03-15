"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

// ---------------- Sortable Item ----------------
function SortableItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex justify-between items-center p-2 border rounded bg-muted cursor-grab"
    >
      <span>{item.name}</span>
      <span className="text-xs text-muted-foreground">
        ID: {item.sort_order}
      </span>
    </div>
  );
}

// ---------------- Reorder Nav Items Popup ----------------
export default function ReorderNavItemsPopup({
  open,
  onClose,
  footer,
  onReorder,
}) {
  const [items, setItems] = useState([]);

  // Update items when footer changes
  useEffect(() => {
    setItems(footer?.nav_items || []);
  }, [footer]);

  if (!footer) return null;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleSave = () => {
    const payload = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    onReorder(footer.id, payload); // call API
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reorder Navigation Items</DialogTitle>
        </DialogHeader>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {items.length > 0 ? (
                items.map((item) => <SortableItem key={item.id} item={item} />)
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No navigation items to reorder
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={items.length === 0}>
            Update Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
