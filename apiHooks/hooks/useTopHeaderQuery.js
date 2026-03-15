import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useTopbars(options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true } = options;

  // GET topbars
  const getTopbars = useQuery({
    queryKey: ["topbars"],
    enabled,
    queryFn: async () => {
      const res = await api.get("topbars");
      return res.data;
    },
  });

  // POST create topbar
  const createTopbar = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("topbars", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["topbars"]);
    },
  });

  // PUT update topbar (only fields for topbar)
  const updateTopbar = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`topbars/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["topbars"]);
    },
  });

  // DELETE topbar (id required)
  const deleteTopbar = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`topbars/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["topbars"]);
    },
  });

  return {
    ...getTopbars,
    createTopbar,
    updateTopbar,
    deleteTopbar,
  };
}
