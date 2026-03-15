import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useSubcategory(query) {
  const [debounceKeyword, setDebounceKeyword] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceKeyword(query);
    }, 600);

    return () => clearTimeout(handler);
  }, [query]);

  const getSubcategories = useQuery({
    queryKey: ["subCategories"],
    queryFn: async () => {
      const res = await api.get(`/sub-category?page=1&limit=20`);
      return res.data;
    },
  });
  const searchSubcategories = useQuery({
    queryKey: ["subCategories",debounceKeyword],
    queryFn: async () => {
      const res = await api.get(`/sub-category?keyword=${debounceKeyword}`);
      return res.data;
    },
  });

  return {
    getSubcategories,
    searchSubcategories,
  };
}
