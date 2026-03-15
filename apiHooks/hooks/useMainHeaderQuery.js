import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useMainHeaderQuery(options = {}) {
  const queryClient = useQueryClient();
  const { enabled = true } = options;
  // GET headers
  const getHeaders = useQuery({
    queryKey: ["headers"],
    enabled,
    queryFn: async () => {
      const res = await api.get("headers");
      return res.data.headers;
    },
  });

  // POST create header
  const createHeader = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("headers", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["headers"]);
    },
  });

  // PUT update header
  const updateHeader = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`headers/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["headers"]);
    },
  });

  // DELETE header
  const deleteHeader = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`headers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["headers"]);
    },
  });

  return {
    ...getHeaders,
    createHeader,
    updateHeader,
    deleteHeader,
  };
}
