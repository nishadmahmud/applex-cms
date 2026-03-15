import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

/* =======================
   GET offer LIST
======================= */
export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await api.get("/latest-offer-list");
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

/* =======================
   CREATE offer
======================= */
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/save-latest-offer", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create offer"
      );
    },
  });
}

/* =======================
   UPDATE offer
======================= */
export function useUpdateoffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.post(`/update-latest-offer/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update offer"
      );
    },
  });
}

/* =======================
   DELETE offer
======================= */
export function useDeleteoffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/delete-latest-offer/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer deleted successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete offer"
      );
    },
  });
}
