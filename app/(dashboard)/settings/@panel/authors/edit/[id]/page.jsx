"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setToken } from "@/app/store/authSlice";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthorForm from "../../AuthorForm";
import axios from "axios";
import { useUpdateAuthorMutation } from "@/app/store/api/authorsApi";

const EditAuthorPage = ({ params }) => {
  const { id } = params;
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [updateAuthor] = useUpdateAuthorMutation();

  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!session?.accessToken) return;
      try {
        const res = await axios.get(
          // Base URL already has /api, so we just call /authors/{id}
          `${process.env.NEXT_PUBLIC_API}/authors/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );
        const data = res.data?.data || res.data;
        setFormData({
          name: data.name || "",
          image: data.image || "",
          description: data.description || "",
          education: data.education || "",
          active: data.active ?? 1,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load author");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAuthor();
    }
  }, [id, status, session]);

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
        id,
        name: formData.name,
        image: imagePath,
        description: formData.description,
        education: formData.education,
        active: formData.active,
      };

      // Use RTK mutation so Author tag invalidates and lists refresh
      await updateAuthor(payload).unwrap();

      toast.success("Author updated successfully");
      router.push("/settings/authors");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update author");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ProtectedRoute featureName={"Settings"} optionName={"Authors"}>
      <AuthorForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        setImageFile={setImageFile}
        isUpdating={isSaving}
        editingMode
      />
    </ProtectedRoute>
  );
};

export default EditAuthorPage;

