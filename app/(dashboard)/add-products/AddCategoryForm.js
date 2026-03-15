"use client";

import { useAddCategoryMutation } from "@/app/store/api/categoryApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label"; // import Label (from shadcn)

export default function AddCategoryForm() {
  const [addCategory] = useAddCategoryMutation();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_featured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      is_featured: formData.is_featured,
    };

    toast.loading("Creating Category");
    try {
      const response = await addCategory(payload).unwrap();
      if (response.success) {
        toast.dismiss();
        toast.success("Category Created Successfully");
        setFormData({ name: "", description: "", is_featured: false });
        setOpen(false);
      } else {
        toast.dismiss();
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Error Occured Try Again");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-white border text-black hover:bg-black hover:text-white"
        >
          <Plus size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="space-y-3 flex flex-col items-center w-72">
        <Input
          name="name"
          onChange={handleChange}
          value={formData.name}
          placeholder="Category Name"
        />
        <Textarea
          name="description"
          onChange={handleChange}
          value={formData.description}
          className="focus-visible:ring-0"
          placeholder="Category Description"
        />

        {/* ✅ Checkbox for Featured */}
        <div className="flex items-center space-x-2 w-full">
          <input
            type="checkbox"
            id="is_featured"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="h-4 w-4 accent-blue-500 cursor-pointer"
          />
          <Label
            htmlFor="is_featured"
            className="text-sm font-medium text-gray-700"
          >
            Featured Category
          </Label>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-400"
        >
          Save
        </Button>
      </PopoverContent>
    </Popover>
  );
}
