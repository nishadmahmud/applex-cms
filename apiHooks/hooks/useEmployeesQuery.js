import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EMPLOYEE_KEY = ["employees"];

export default function useEmployees(
  params = { page: 1, limit: 10, keyword: "" }
) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [...EMPLOYEE_KEY, params],
    queryFn: async () => {
      const endpoint = params.keyword ? "/search-employee" : "/employee";
      let res;
      if (params.keyword?.trim()) {
        res = await api.post(
          `${endpoint}?page=${params.page}&limit=${params.limit}`,
          {
            keyword: params.keyword,
          }
        );
      } else {
        res = await api.get(
          `${endpoint}?page=${params.page}&limit=${params.limit}`
        );
      }

      const response = res?.data;
      const data = response?.data?.data || response?.data || [];
      const meta = response?.data || {};
      return { data, meta };
    },
  });

  const createEmployee = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/save-employee", payload);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Employee added successfully");
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add"),
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.post("/update-employee", {
        emp_id: id,
        ...payload,
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Employee updated");
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEY });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update"),
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id) => {
      const res = await api.post("/delete-employee", { employee_id: id });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Deleted successfully");
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEY });
    },
    onError: (err) => toast.error("Delete failed"),
  });

  return { ...listQuery, createEmployee, updateEmployee, deleteEmployee };
}
