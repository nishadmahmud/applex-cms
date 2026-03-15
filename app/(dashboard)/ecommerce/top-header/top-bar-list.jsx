"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2 } from "lucide-react";

export function TopBarList({ topbars, bg_color, onEdit, onDelete }) {
  if (!topbars?.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No topbars found.
      </div>
    );
  }

  return (
    <Card>
      {/* BG Color Preview */}
      <CardHeader className="pb-2">
        <div className="flex gap-2 items-center justify-between mb-2">
          {/* Hex code display */}
          <span className="text-sm font-mono text-gray-700">{bg_color}</span>
          {/* Color preview box */}
          <div
            className="h-6 w-full rounded border border-gray-300 "
            style={{ backgroundColor: bg_color }}
          ></div>
        </div>
        <Separator />
        <CardTitle className="flex justify-between items-center py-2">
          Top Headers ({topbars.length})
          {/* <span className="text-sm text-gray-500">
            Priority: Higher = Shown First
          </span> */}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {topbars.map((topbar) => (
            <div
              key={topbar.id}
              className="border p-4 rounded-lg hover:bg-muted transition-colors space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{topbar.title}</h4>
                  <p className="text-sm text-gray-500">
                    {topbar.description || "No description"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Link: {topbar.link}</span>
                    <span>•</span>
                    <span>Priority: {topbar.priority}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={topbar.status ? "success" : "destructive"}>
                    {topbar.status ? "Active" : "Inactive"}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(topbar)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(topbar.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
