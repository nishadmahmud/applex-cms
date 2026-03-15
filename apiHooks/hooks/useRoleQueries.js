"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

const ROLE_KEY = ["role-feature-option-list"];

// ✅ Get all roles list
export function useRoleList() {
  return useQuery({
    queryKey: ROLE_KEY,
    queryFn: async () => {
      const res = await api.get("/role-feature-option-list");
      return res?.data?.data || [];
    },
    staleTime: 60 * 1000,
  });
}

// ✅ Get a single role (for editing)
export function useRole(roleId) {
  return useQuery({
    queryKey: [...ROLE_KEY, roleId],
    queryFn: async () => {
      const res = await api.get(`/role-feature-option-list/${roleId}`);
      return res?.data?.data;
    },
    enabled: !!roleId,
  });
}

// ✅ Create new role
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/save-role", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Role created successfully");
      queryClient.invalidateQueries({ queryKey: ROLE_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create role"),
  });
}

// ✅ Update existing role
export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/update-role", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ROLE_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update role"),
  });
}
