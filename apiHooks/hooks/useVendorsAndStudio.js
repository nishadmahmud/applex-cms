"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "@/lib/api"; // ✅ use your axios instance

// ---------- Vendor Hooks ----------
export function useVendorList(query) {
  const [debounce, setDebounce] = useState(query);

  useEffect(() => {
    const h = setTimeout(() => setDebounce(query), 600);
    return () => clearTimeout(h);
  }, [query]);

  const search = useQuery({
    queryKey: ["searchVendor", debounce],
    queryFn: async () => {
      const res = await api.post(`/search-vendor?page=1&limit=10`, {
        keyword: debounce,
      });
      return res.data;
    },
    enabled: !!query?.length,
  });

  const list = useQuery({
    queryKey: ["vendorList"],
    queryFn: async () => {
      const res = await api.get(`/vendor-lists?page=1&limit=10`);
      return res.data;
    },
  });

  return { search, list };
}

// ---------- Studio Hooks ----------
export function useStudioList(page = 1) {
  return useQuery({
    queryKey: ["studio-list", page],
    queryFn: async () => {
      const res = await api.get(`/studio-list?page=${page}`);
      return res.data;
    },
  });
}

export function useCreateStudio() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/save-studio`, payload);
      return res.data;
    },
    onSuccess: () => client.invalidateQueries(["studio-list"]),
  });
}

export function useUpdateStudio() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.post(`/update-studio/${id}`, payload);
      return res.data;
    },
    onSuccess: () => client.invalidateQueries(["studio-list"]),
  });
}

export function useDeleteStudio() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/delete-studio/${id}`);
      return res.data;
    },
    onSuccess: () => client.invalidateQueries(["studio-list"]),
  });
}
