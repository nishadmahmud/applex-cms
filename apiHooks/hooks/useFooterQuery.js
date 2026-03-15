import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useFooter(options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  // GET footers
  const getFooters = useQuery({
    queryKey: ["footers"],
    enabled,
    queryFn: async () => {
      const res = await api.get("footers");
      return res.data;
    },
  });

  // POST create footer
  const createFooter = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("footers", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footers"]);
    },
  });

  // PUT update footer
  const updateFooter = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`footers/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footers"]);
    },
  });

  // DELETE footer
  const deleteFooter = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`footers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["footers"]);
    },
  });

  // POST reorder nav_items
  const reorderNavItems = useMutation({
    mutationFn: async ({ id, nav_items }) => {
      const res = await api.post(`footers/${id}/reorder`, { nav_items });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["footers"]),
  });

  return {
    ...getFooters,
    createFooter,
    updateFooter,
    deleteFooter,
    reorderNavItems,
  };
}
