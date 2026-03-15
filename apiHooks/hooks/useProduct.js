import api from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'

export default function useProduct() {

    const searchProducts = useMutation({
        mutationFn: async (keyword) => {
            const res = await api.post('/search-product-v1?page=1&limit=10', {keyword});
            return res.data;
        }
    })

    const getProducts = useQuery({
        queryKey: ['Products'],
        queryFn: () => api.get(`/product?page=1&limit=10`)
    })


    return {
        searchProducts,
        ...getProducts
    }
}
