"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import {
  ADDITIONAL_INFOS_FIELDS,
  clearAdditionalInfosStorage,
  readAdditionalInfosFromStorage,
  writeAdditionalInfosToStorage,
} from "@/app/utils/additionalInfosStorage";

function shorten(text, max = 55) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function AdditionalInfosForm() {
  const emptyState = useMemo(() => {
    const base = {};
    for (const f of ADDITIONAL_INFOS_FIELDS) base[f.key] = [];
    return base;
  }, []);

  const [values, setValues] = useState(emptyState);
  const [addingKey, setAddingKey] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const stored = readAdditionalInfosFromStorage();
    const next = { ...emptyState };
    for (const f of ADDITIONAL_INFOS_FIELDS) {
      next[f.key] = Array.isArray(stored?.[f.key]) ? stored[f.key] : [];
    }
    setValues(next);
  }, [emptyState]);

  const persist = (next) => {
    setValues(next);
    writeAdditionalInfosToStorage(next);
  };

  const handleStartAdd = (key) => {
    setAddingKey(key);
    setDraft("");
  };

  const handleCancelAdd = () => {
    setAddingKey("");
    setDraft("");
  };

  const handleConfirmAdd = (key) => {
    const v = (draft || "").trim();
    if (!v) {
      toast.error("Enter a value first");
      return;
    }

    const current = Array.isArray(values[key]) ? values[key] : [];
    // Keep unique, keep order (append)
    const exists = current.some((x) => (x || "").trim() === v);
    const nextList = exists ? current : [...current, v];

    const next = { ...values, [key]: nextList };
    persist(next);
    setDraft("");
    setAddingKey("");
    toast.success("Saved");
  };

  const handleDelete = (key, index) => {
    const current = Array.isArray(values[key]) ? values[key] : [];
    const nextList = current.filter((_, i) => i !== index);
    const next = { ...values, [key]: nextList };
    persist(next);
    toast.success("Removed");
  };

  const handleClearAll = () => {
    try {
      clearAdditionalInfosStorage();
      setValues(emptyState);
      setAddingKey("");
      setDraft("");
      toast.success("All additional infos cleared");
    } catch {
      toast.error("Failed to clear additional infos");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Additional infos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Save multiple presets per field. These are stored in this browser
            (localStorage).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADDITIONAL_INFOS_FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-semibold text-gray-700">
                  {f.label}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartAdd(f.key)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {addingKey === f.key && (
                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-2">
                  {/* Small input for quick entry; user can paste multi-line too */}
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={f.placeholder}
                    className="min-h-[70px] resize-y bg-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelAdd}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleConfirmAdd(f.key)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {Array.isArray(values[f.key]) && values[f.key].length ? (
                  values[f.key].map((item, idx) => (
                    <div
                      key={`${f.key}-${idx}`}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <div className="text-sm text-gray-800 whitespace-pre-wrap break-words flex-1">
                        {shorten(item, 140) || "—"}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(f.key, idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No saved presets yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClearAll}>
            Clear all
          </Button>
        </div>
      </Card>
    </div>
  );
}

