import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DEPARTMENT_KEY = ["departments"];

export default function useDepartments(
  params = { page: 1, limit: 20, keyword: "" }
) {
  const queryClient = useQueryClient();

  // 🔹 GET: list + search
  const listQuery = useQuery({
    queryKey: [...DEPARTMENT_KEY, params],
    queryFn: async () => {
      const endpoint = params.keyword ? "/search-department" : "/department";
      let res;

      // ✅ Correct API calls
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
  const createDept = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/save-department", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Department created");
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create"),
  });

  // 🔹 UPDATE
  const updateDept = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.post(`/update-department/${id}`, payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Department updated");
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update"),
  });

  // 🔹 DELETE
  const deleteDept = useMutation({
    mutationFn: async (id) => {
      const res = await api.post("/delete-department", { departmentId: id });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Department deleted");
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  return { ...listQuery, createDept, updateDept, deleteDept };
}
