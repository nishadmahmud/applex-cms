import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

/* =======================
   GET BLOG LIST
======================= */
export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await api.get("/latest-blog-list");
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

/* =======================
   CREATE BLOG
======================= */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/save-latest-blog", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to create blog"
      );
    },
  });
}

/* =======================
   UPDATE BLOG
======================= */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.post(`/update-latest-blog/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update blog"
      );
    },
  });
}

/* =======================
   DELETE BLOG
======================= */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/delete-latest-blog/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully!");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete blog"
      );
    },
  });
}
