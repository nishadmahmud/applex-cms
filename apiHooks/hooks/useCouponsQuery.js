// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import api from "@/lib/api";
// import { toast } from "sonner";

// export function useCoupons() {
//   return useQuery({
//     queryKey: ["coupons"],
//     queryFn: () => api.get("/coupon-list"),
//   });
// }

// export function useCreateCoupon() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data) => api.post("/save-coupon", data),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({ queryKey: ["coupons"] });
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to create coupon");
//     },
//   });
// }

// export function useUpdateCoupon() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }) => api.post(`/update-coupon/${id}`, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["coupons"] });
//       toast.success("Coupon updated successfully!");
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to update coupon");
//     },
//   });
// }

// export function useDeleteCoupon() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id) => api.delete(`/delete-coupon/${id}`),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["coupons"] });
//       //   toast.success(response.message || "Coupon deleted successfully!");
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to delete coupon");
//     },
//   });
// }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: () => api.get("/coupon-list"),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post("/save-coupon", data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["coupons"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({ queryKey: ["coupons"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/update-coupon/${id}`, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["coupons"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({ queryKey: ["coupons"] });
      toast.success("Coupon updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/delete-coupon/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["coupons"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({ queryKey: ["coupons"] });
      //   toast.success(response.message || "Coupon deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });
}
