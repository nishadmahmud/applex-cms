// hooks/useDashboard.js
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useDashboard(
  interval = "daily",
  { enabled = true } = {}
) {
  // queryKey includes interval so query is cached per interval
  const query = useQuery({
    queryKey: ["dashboard", interval],
    queryFn: async () => {
      const res = await api.get(`/web-dashboard?interval=${interval}`);
      return res.data;
    },
    enabled,
  });

  return query; // { data, isLoading, isError, error, refetch, ... }
}
