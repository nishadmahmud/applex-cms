import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";


export default function useWarehouseQuery() {
  const {data,isLoading,error} = useQuery({
    queryKey : ['Warehouse'],
    queryFn : () => api.get('/warehouses-list')
  }) 

  return {data,isLoading,error};
}
