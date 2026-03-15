import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';



const useCampaign = () => {
      const queryClient = useQueryClient();
     const updateCampaign = useMutation({
       mutationFn : async ({id,payload}) => {
         return await api.post(`/campaigns/${id}`, payload);
       },
       onSuccess : (response) => {
         queryClient.invalidateQueries(['campaigns']);
         toast.success(response.data.message);
       }
     })

     return { 
        updateCampaign
     }
};

export default useCampaign;