"use client";

import { useAddChildCategoryMutation } from "@/app/store/api/categoryApi";
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

export default function AddChildCategoryForm({ subcategories }) {
  console.log({ subcategories });
  const [open, setOpen] = useState(false);
  const [addChildCategory] = useAddChildCategoryMutation();
  const [formData, setFormData] = useState({
    sub_category_id: "",
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.sub_category_id) {
      toast.error("Please select a subcategory");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      sub_category_id: formData.sub_category_id,
    };

    toast.loading("Creating Child Category");

    try {
      const response = await addChildCategory(payload).unwrap();
      console.log(response);
      if (response.success) {
        toast.dismiss();
        toast.success("Child Category Created Successfully");
        setOpen(false);
        setFormData({ sub_category_id: "", name: "", description: "" });
      } else {
        toast.dismiss();
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Error Occurred. Try Again");
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
            subcategories?.length
              ? subcategories.map((item) => ({
                  value: item.name,
                  label: item.name,
                  id: item.id,
                }))
              : []
          }
          value={
            formData.sub_category_id
              ? {
                  value: formData.sub_category_id,
                  label:
                    subcategories?.find(
                      (sub) => sub.id === formData.sub_category_id
                    )?.name || "",
                }
              : null
          }
          onChange={(selectedOption) => {
            setFormData({ ...formData, sub_category_id: selectedOption?.id });
          }}
          placeholder="Select Subcategory"
          className="w-full"
        />
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Child Category Name"
        />
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="focus-visible:ring-0"
          placeholder="Child Category Description"
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
