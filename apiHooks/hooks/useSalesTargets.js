import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

/* =======================
   PRODUCT LIST
======================= */
export function useProducts({ page = 1, limit = 10 } = {}) {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: async () => {
      const res = await api.get("/product", { params: { page, limit } });
      // shape: res.data.data.data → array
      const list = res?.data?.data?.data ?? [];
      return list;
    },
    keepPreviousData: true,
  });
}

/* =======================
   SEARCH PRODUCT (POST)
======================= */
export function useSearchProducts({
  query,
  page = 1,
  limit = 10,
  enabled = true,
}) {
  return useQuery({
    queryKey: ["search-products", query, page, limit],
    queryFn: async () => {
      const res = await api.post("/search-product-v1", { query, page, limit });
      const list = res?.data?.data?.data ?? [];
      return list;
    },
    enabled: enabled && !!query,
    keepPreviousData: true,
  });
}

/* =======================
   SALES TARGET REPORT
======================= */
export function useSalesTargetReport({
  date,
  product_id,
  page = 1,
  per_page = 10,
}) {
  return useQuery({
    queryKey: ["sales-target-report", date, product_id, page, per_page],
    queryFn: async () => {
      const res = await api.get("/sales-target-report", {
        params: { date, product_id, page, per_page },
      });
      return res.data;
    },
    enabled: !!date,
    keepPreviousData: true,
  });
}

/* =======================
   DETAILS
======================= */
export function useSalesTargetDetails(id, enabled = true) {
  return useQuery({
    queryKey: ["sales-target-details", id],
    queryFn: async () => {
      const res = await api.get(`/sales-target-details/${id}`);
      return res.data;
    },
    enabled: !!id && enabled,
  });
}

/* =======================
   CREATE
======================= */
export function useCreateSalesTarget(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/save-sales-target", payload);
      return res.data;
    },
    onSuccess: (data, vars, ctx) => {
      qc.invalidateQueries({ queryKey: ["sales-target-report"] });
      toast.success("Sales target created successfully");
      options?.onSuccess?.(data, vars, ctx);
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || "Failed to create sales target"
      ),
  });
}

/* =======================
   UPDATE
======================= */
export function useUpdateSalesTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.post(`/update-sales-target/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-target-report"] });
      toast.success("Sales target updated successfully");
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || "Failed to update sales target"
      ),
  });
}

/* =======================
   DELETE
======================= */
export function useDeleteSalesTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/delete-sales-target/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-target-report"] });
      toast.success("Sales target deleted successfully");
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || "Failed to delete sales target"
      ),
  });
}
