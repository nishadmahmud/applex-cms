import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export default function useVendorQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn : async(payload) => {
        const res = await api.post(`search-vendor`, payload);
            return res.data;
    },
    onSuccess : (data, payload) => {
            queryClient.setQueryData(['VendorSearchQuery', payload.keyword], data)
    }
  })

}
