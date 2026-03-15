"use client";

import { React, useState, useMemo } from "react";
import { toast } from "sonner";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { Loader2, Save, Tags } from "lucide-react";
import {
  useSaveTagsMutation,
  useUpdateTagMutation,
} from "@/app/store/api/tagsApi";

/**
 * TagsForm component for creating new tags (bulk) or updating a single existing tag.
 * @param {object} props
 * @param {object} props.tag - The tag object to edit (null for creation).
 * @param {function} props.onClose - Function to close the parent dialog/modal.
 */
const TagsForm = ({ tag, onClose }) => {
  const isEditing = useMemo(() => !!tag, [tag]);

  // State for single name (edit) or multiple names (create)
  const [inputContent, setInputContent] = useState(isEditing ? tag.name : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [saveTags] = useSaveTagsMutation();
  const [updateTag] = useUpdateTagMutation();

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) {
      toast.error("Please enter at least one tag name.");
      return;
    }

    setIsSubmitting(true);

    // Split input by new lines and commas, clean up whitespace, and filter out empty strings
    const rawNames = inputContent.split(/[\n,]/).map((s) => s.trim());
    const uniqueNames = [
      ...new Set(rawNames.filter((name) => name.length > 0)),
    ];

    if (uniqueNames.length === 0) {
      toast.error("No valid tag names were entered.");
      setIsSubmitting(false);
      return;
    }

    const payload = { tags: uniqueNames.map((name) => ({ name })) };

    try {
      await saveTags(payload).unwrap();
      toast.success(`${uniqueNames.length} tag(s) created successfully!`);
      onClose(); // Close the dialog on success
    } catch (err) {
      console.error("Failed to create tags:", err);
      toast.error(
        `Failed to create tags. ${
          (err.data?.message || err.error) ?? "Server Error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const newName = inputContent.trim();

    if (!newName) {
      toast.error("Tag name cannot be empty.");
      return;
    }
    if (newName === tag.name) {
      toast.info("No changes detected.");
      onClose();
      return;
    }

    setIsSubmitting(true);
    const payload = { id: tag.id, name: newName };

    try {
      await updateTag(payload).unwrap();
      toast.success(`Tag updated to "${newName}" successfully!`);
      onClose(); // Close the dialog on success
    } catch (err) {
      console.error("Failed to update tag:", err);
      toast.error(
        `Failed to update tag. ${
          (err.data?.message || err.error) ?? "Server Error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={isEditing ? handleUpdateSubmit : handleCreateSubmit}
      className="space-y-6 pt-4"
    >
      {isEditing ? (
        // --- Edit Mode (Single Input) ---
        <div className="space-y-2">
          <Label htmlFor="tagName">Tag Name</Label>
          <Input
            id="tagName"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="e.g., Vehicle"
            required
            autoFocus
            className="h-10 text-base"
          />
        </div>
      ) : (
        // --- Create Mode (Bulk Textarea) ---
        <div className="space-y-2">
          <Label htmlFor="tagNames">Enter Tag Names</Label>
          <Textarea
            id="tagNames"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Enter tags, one per line or separated by commas.&#10;Example:&#10;Vehicle&#10;Testing&#10;Accessories"
            rows={6}
            required
            autoFocus
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            Enter multiple tags separated by new lines or commas.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <Save className="mr-2 h-4 w-4" />
          ) : (
            <Tags className="mr-2 h-4 w-4" />
          )}
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Create Tags"}
        </Button>
      </div>
    </form>
  );
};

export default TagsForm;
