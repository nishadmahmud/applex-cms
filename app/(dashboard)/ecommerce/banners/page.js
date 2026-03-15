"use client";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";
import EditBannerUi from "./EditBannerUi";
import { toast } from "sonner";

const EditBanner = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["Banners"],
    queryFn: () => api.get(`/public/banners/${session.user.id}`),
    enabled: status === "authenticated",
  });

  const editBannerMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await api.post(`/new/update-banners/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["Banners"]);
      toast.success("Banner Updated");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleSave = (id, bannerData) => {
    editBannerMutation.mutate({ id, payload: bannerData });
  };

  const removeBanner = useMutation({
    mutationFn: (id) => {
      return api.delete(`/new/delete-banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["Banners"]);
      toast.success("Deleted Successfully");
    },
  });

  return (
    <div>
      <EditBannerUi
        banners={data?.data?.banners}
        onUpdate={handleSave}
        onRemove={removeBanner}
      />
    </div>
  );
};

export default EditBanner;
