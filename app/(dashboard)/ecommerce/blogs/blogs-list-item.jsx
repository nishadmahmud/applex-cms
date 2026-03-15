/* eslint-disable react/prop-types */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

export function BlogListItem({ index, blog, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-[40px_1fr_1fr_1fr_120px] gap-2 py-3 border-b items-center text-sm">
      {/* SL */}
      <div>{index}</div>

      {/* TITLE */}
      <div className="font-medium truncate">
        {blog.title}
      </div>

      {/* SLUG */}
      <div className="text-muted-foreground truncate">
        {blog.slug || "-"}
      </div>

      {/* STATUS */}
      <div>
        <Badge variant={blog.status === 1 ? "default" : "destructive"}>
          {blog.status === 1 ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onEdit(blog)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(blog.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
