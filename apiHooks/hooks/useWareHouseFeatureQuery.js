"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

const WAREHOUSE_KEY = ["warehouse"];

// Utility to extract meaningful error message
function extractErrorMessage(err, defaultMessage) {
  const data = err?.response?.data;
  if (data?.errors) {
    // Flatten field errors into readable text
    const firstField = Object.keys(data.errors)[0];
    return data.errors[firstField][0];
  }
  return data?.message || defaultMessage;
}

// ✅ Fetch all warehouses
export function useWarehouseList(userId) {
  return useQuery({
    queryKey: [...WAREHOUSE_KEY, userId],
    queryFn: async () => {
      const res = await api.get(`/stores/user/${userId}`);
      return res.data || [];
    },
    enabled: !!userId,
  });
}

// ✅ Create warehouse
export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/warehouses", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Warehouse created successfully");
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEY });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to create warehouse"));
    },
  });
}

// ✅ Update warehouse
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await api.post(`/warehouses/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Warehouse updated successfully");
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEY });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to update warehouse"));
    },
  });
}

// ✅ Activate warehouse
export function useActivateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/warehouses-activate/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Warehouse activated successfully");
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEY });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to activate warehouse"));
    },
  });
}

// ✅ Deactivate warehouse
export function useDeactivateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/warehouses-deactivate/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Warehouse deactivated successfully");
      queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEY });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to deactivate warehouse"));
    },
  });
}
