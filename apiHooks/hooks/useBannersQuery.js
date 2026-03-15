import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useBanners() {
  const queryClient = useQueryClient();

  const getBanners = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await api.get("banners");
      return res.data;
    },
  });

  const createBanners = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`create-banner`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
    },
  });

  return {
    ...getBanners,
    createBanners,
  };
}
