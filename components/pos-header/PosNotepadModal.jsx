"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/app/utils/Modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PosNotepadModal({ open, onClose }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("posNote");
    if (stored) setNote(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem("posNote", note);
    onClose();
  };

  return (
    <Modal
      title="POS Notepad"
      open={open}
      onClose={onClose}
      content={
        <div className="space-y-3">
          <Textarea
            className="min-h-[200px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your note here..."
          />
          <Button
            onClick={handleSave}
            className="bg-blue-500 text-white hover:bg-blue-600 w-full"
          >
            Save Note
          </Button>
        </div>
      }
    />
  );
}
