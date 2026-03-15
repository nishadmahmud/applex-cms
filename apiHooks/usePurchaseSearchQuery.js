import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function usePurchaseSearchQuery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await api.post(`/search-product-purchase?page=1&limit=15`, payload);
            return res.data.data;
        },
        onSuccess: (data, payload) => {
            queryClient.setQueryData(['PurchaseSearchQuery', payload.keyword], data)
        }
    })
}
