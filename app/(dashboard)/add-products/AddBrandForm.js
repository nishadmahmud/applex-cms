"use client";

import { useCreateBrandMutation } from "@/app/store/api/brandsApi";
import { setToken } from "@/app/store/authSlice";
import { ImageUploader } from "@/app/utils/ImageUploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export default function AddBrandForm({ imageHandler }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [createBrand, { isLoading }] = useCreateBrandMutation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_path: "",
    is_topbrand: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const handleSubmit = async () => {
    toast.loading("Creating Brand");
    const updatedFormData = { ...formData };
    if (selectedImage) {
      const image_path = await imageHandler(selectedImage);
      setFormData({ updatedFormData, image_path });
    }
    setFormData(updatedFormData);
    const payload = {
      name: updatedFormData.name,
      description: updatedFormData.description,
      is_topbrand: updatedFormData.is_topbrand,
      image_path: updatedFormData.image_path,
    };
    try {
      await createBrand(payload).unwrap();
      toast.dismiss();
      toast.success("Brand Created Successfully");
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Error Occured");
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
        <Input onChange={handleChange} name="name" placeholder="Brand Name" />
        <div className="border border-gray-300 w-full p-1 rounded-lg">
          <p className="text-sm font-medium text-[#374151] mb-2">{`Brand's Logo`}</p>
          <ImageUploader
            onImageChange={(list) => {
              setSelectedImage(list?.file);
            }}
          />
        </div>
        <Textarea
          onChange={handleChange}
          name="description"
          className="focus-visible:ring-0"
          placeholder="Brand Description"
        />
        <div className="flex justify-start items-center w-full gap-3">
          <Checkbox
            checked={!!formData.is_topbrand}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_topbrand: !!checked })
            }
            id="terms"
          />
          <Label className="text-[#374151]" htmlFor="terms">
            Top Brand
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
