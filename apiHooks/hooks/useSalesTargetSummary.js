// hooks/useSalesTargetSummary.js
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function useSalesTargetSummary(date, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["sales-target-summary", date],
    queryFn: async () => {
      const res = await api.get(`/sales-target-summary?date=${date}`);
      return res.data;
    },
    enabled,
  });
}
