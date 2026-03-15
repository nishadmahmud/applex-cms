"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReactSelect from "react-select";
import { toast } from "sonner";
import useSubcategory from "@/apiHooks/hooks/useSubcategory";

const ChildCategoryFormModal = ({
  open,
  onOpenChange,
  onSave,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    sub_category_id: "",
    name: "",
    description: "",
  });
  const [search, setSearch] = useState("");

  // load subcategories (list + search)
  const { getSubcategories, searchSubcategories } = useSubcategory(search);
  const isSearching = search.trim().length > 0;
  const subcategoryData = isSearching
    ? searchSubcategories?.data
    : getSubcategories?.data;

  const subcategoryOptions = subcategoryData?.data?.data
    ? subcategoryData.data.data.map((item) => ({
        value: item.id,
        label: item.name,
      }))
    : [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        sub_category_id: initialData.sub_category_id || "",
        name: initialData.name || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({ sub_category_id: "", name: "", description: "" });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.sub_category_id) {
      toast.error("Please select subcategory");
      return;
    }
    if (!formData.name) {
      toast.error("Name required");
      return;
    }
    await onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Child Category" : "Add Child Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Subcategory dropdown with search */}
          <ReactSelect
            options={subcategoryOptions}
            value={
              formData.sub_category_id
                ? subcategoryOptions.find(
                    (opt) => opt.value === formData.sub_category_id
                  )
                : null
            }
            isLoading={
              getSubcategories.isLoading || searchSubcategories.isLoading
            }
            onChange={(opt) =>
              setFormData((p) => ({ ...p, sub_category_id: opt?.value }))
            }
            onInputChange={(val, { action }) => {
              if (action === "input-change") setSearch(val);
            }}
            placeholder="Search or select subcategory"
            className="w-full"
          />

          <Input
            name="name"
            value={formData.name}
            placeholder="Child Category Name"
            onChange={handleChange}
          />

          <Textarea
            name="description"
            value={formData.description}
            placeholder="Description"
            onChange={handleChange}
          />

          <Button onClick={handleSubmit} className="w-full bg-blue-600">
            {initialData ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildCategoryFormModal;
