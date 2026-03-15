import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export default function useSliders({id}) {
    const queryClient = useQueryClient();

    const getSliders = useQuery({
        queryKey: ['sliders',id],
        queryFn: async () => {
            const res = await api.get(`public/sliders/${id}`);
            return res.data;
        },
        enabled : !!id
    })

    const createBanners = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post(`/new/save-sliders`, payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sliders'])
        }
    })


    return {
        ...getSliders,
        createBanners
    }

}
