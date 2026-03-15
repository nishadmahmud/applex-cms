import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DESIGNATION_KEY = ["designations"];

export default function useDesignations(
  params = { page: 1, limit: 10, keyword: "" }
) {
  const queryClient = useQueryClient();

  // 🔹 GET: list + search
  const listQuery = useQuery({
    queryKey: [...DESIGNATION_KEY, params],
    queryFn: async () => {
      const endpoint = params.keyword ? "/search-designation" : "/designation";
      let res;

      if (params.keyword?.trim()) {
        res = await api.post(
          `${endpoint}?page=${params.page}&limit=${params.limit}`,
          { keyword: params.keyword }
        );
      } else {
        res = await api.get(
          `${endpoint}?page=${params.page}&limit=${params.limit}`
        );
      }

      const response = res?.data;
      const data = response?.data?.data || [];
      const meta = response?.data || {};
      return { data, meta };
    },
  });

  // 🔹 CREATE
  const createDesignation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/save-designation", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Designation created");
      queryClient.invalidateQueries({ queryKey: DESIGNATION_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create"),
  });

  // 🔹 UPDATE
  const updateDesignation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.post(`/update-designation/${id}`, payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Designation updated");
      queryClient.invalidateQueries({ queryKey: DESIGNATION_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update"),
  });

  // 🔹 DELETE
  const deleteDesignation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post("/delete-designation", {
        designation_id: id,
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Designation deleted");
      queryClient.invalidateQueries({ queryKey: DESIGNATION_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  return {
    ...listQuery,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  };
}
