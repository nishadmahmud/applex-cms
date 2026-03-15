import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function topSaleProducts({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: ["top-sales"],
    queryFn: async () => {
      const res = await api.get(`/top-sales`);
      return res.data; // API envelope
    },
    enabled,
  });

  return {
    topSaleProductsEnvelope: query.data,
    topSaleProductsItems: query.data?.data ?? [], // envelope.data.data -> array
    topSaleProductsMeta: query.data?.meta ?? query.data?.data?.meta ?? null, // if your API has meta
    isTopSaleProductsLoading: query.isLoading,
    isTopSaleProductsError: query.isError,
    topSaleProductsError: query.error,
    topSaleProductsRefetch: query.refetch,
  };
}
