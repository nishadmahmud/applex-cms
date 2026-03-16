"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  RemoveFormatting,
  Loader2,
  NotebookText,
} from "lucide-react";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const TOOLBAR_BUTTONS = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "underline", icon: Underline, label: "Underline" },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Ordered List" },
  { cmd: "insertUnorderedList", icon: List, label: "Unordered List" },
  { cmd: "removeFormat", icon: RemoveFormatting, label: "Clear Formatting" },
];

export default function SmartNotepadModal({ open, onClose }) {
  const editorRef = useRef(null);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteId, setNoteId] = useState(null);

  // Fetch note on open
  useEffect(() => {
    if (!open) return;
    const fetchNote = async () => {
      setLoading(true);
      try {
        const res = await api.post("/get-note", {
          employee_id: session?.isEmployee ? session?.employee?.id : "",
        });
        const notes = res?.data?.data;
        if (notes && notes.length > 0) {
          const latestNote = notes[0];
          setNoteId(latestNote.id);
          if (editorRef.current) {
            editorRef.current.innerHTML = latestNote.note || "";
          }
        } else {
          setNoteId(null);
          if (editorRef.current) editorRef.current.innerHTML = "";
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [open, session]);

  const execCmd = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      editorRef.current?.focus();
    }
  }, []);

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || "";
    setSaving(true);
    try {
      await api.post("/save-note", {
        employee_id: session?.isEmployee ? session?.employee?.id : "",
        note: content,
        ...(noteId && { id: noteId }),
      });
      toast.success("Note saved successfully");
      onClose();
    } catch (err) {
      console.error("Failed to save note:", err);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      editorRef.current.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden p-0 rounded-xl">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <NotebookText className="w-5 h-5 text-orange-500" />
            Smart Notepad
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 flex flex-col gap-3">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 flex-wrap border border-gray-200 rounded-lg p-1.5 bg-gray-50">
            {TOOLBAR_BUTTONS.map(({ cmd, icon: Icon, label }) => (
              <button
                key={cmd}
                type="button"
                title={label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd(cmd);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600 hover:text-black"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
            <button
              type="button"
              title="Insert Link"
              onMouseDown={(e) => {
                e.preventDefault();
                handleLink();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600 hover:text-black"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>

          {/* Editor */}
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[200px] max-h-[350px] overflow-y-auto p-4 text-sm text-gray-800 outline-none focus:ring-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-blue-600 [&_a]:underline"
              style={{ lineHeight: 1.7 }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="px-6 text-sm font-semibold"
            >
              Clear
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
