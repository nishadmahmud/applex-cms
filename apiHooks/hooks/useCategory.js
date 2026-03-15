import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react';

export default function useCategory(query) {

    const [debounceKeyword,setDebounceKeyword] = useState(query);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounceKeyword(query)
        }, 600);

        return () => clearTimeout(handler)
    },[query])

    const searchCategories = useQuery({
        queryKey: ['searchCategories',debounceKeyword],
        queryFn: async() => {
          const res = await api.get(`/get-all-category?search=${debounceKeyword}`);
          return res.data;
        },
        enabled : !!query
    })

    const getCategories = useQuery({
        queryKey: ['categories'],
        queryFn: async() => {
            const res = await api.get(`/get-all-category?page=${1}&limit=${10}`)
            return res.data;
        }
    })


    return {
        searchCategories,
        getCategories
    }
}
