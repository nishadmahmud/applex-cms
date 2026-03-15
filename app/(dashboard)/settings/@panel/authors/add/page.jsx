"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setToken } from "@/app/store/authSlice";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthorForm from "../AuthorForm";
import axios from "axios";
import { useCreateAuthorMutation } from "@/app/store/api/authorsApi";

const AddAuthorPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [createAuthor] = useCreateAuthorMutation();

  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    education: "",
    active: 1,
  });

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(setToken(session.accessToken));
    }
  }, [status, session, dispatch]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      let imagePath = formData.image;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file_name", imageFile);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/file-upload`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        imagePath = res.data?.path || imagePath;
      }

      const payload = {
        name: formData.name,
        image: imagePath,
        description: formData.description,
        education: formData.education,
        active: formData.active,
      };

      // Use RTK mutation so Author tag invalidates and lists refresh
      await createAuthor(payload).unwrap();

      toast.success("Author created successfully");
      router.push("/settings/authors");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create author");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Authors"}>
      <AuthorForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        setImageFile={setImageFile}
        isUpdating={isSaving}
      />
    </ProtectedRoute>
  );
};

export default AddAuthorPage;

