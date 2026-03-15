"use client";

import { useAddSubcategoryMutation } from "@/app/store/api/categoryApi";
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
import ReactSelect from "react-select";
import { toast } from "sonner";

export default function AddSubCategoryForm({ categories }) {
  const [open, setOpen] = useState(false);
  const [addSubcategory] = useAddSubcategoryMutation();
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
    };
    toast.loading("Creating Subcategory");
    try {
      const response = await addSubcategory(payload).unwrap();
      console.log(response);
      if (response.success) {
        toast.dismiss();
        toast.success("Subcategory Created Successfully");
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
      <PopoverContent className="space-y-2 flex flex-col items-center">
        <ReactSelect
          options={
            categories?.length
              ? categories?.map((item) => ({
                  value: item.name,
                  label: item.name,
                  id: item.id,
                }))
              : []
          }
          value={
            formData.category_id
              ? {
                  value: formData.category_id,
                  label:
                    categories?.find((cat) => cat.id === formData.category_id)
                      ?.name || "",
                }
              : null
          }
          onChange={(selectedOption) => {
            setFormData({ ...formData, category_id: selectedOption?.id });
          }}
          placeholder="Select Category"
          className="w-full"
        />
        <Input
          name="name"
          onChange={handleChange}
          placeholder="Subcategory Name"
        />
        <Textarea
          name="description"
          onChange={handleChange}
          className="focus-visible:ring-0"
          placeholder="Subcategory Description"
        />
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
