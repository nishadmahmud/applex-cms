// import api from "@/lib/api";
// import { useQuery } from "@tanstack/react-query";
// import { useEffect, useState } from "react";

// export default function useChildCategory(query) {
//   const [debounceKeyword, setDebounceKeyword] = useState(query);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebounceKeyword(query);
//     }, 600);

//     return () => clearTimeout(handler);
//   }, [query]);

//   const getChildCategories = useQuery({
//     queryKey: ["child-category"],
//     queryFn: async () => {
//       const res = await api.get(
//         `/child-category?page=1&limit=20 `
//       );
//       return res.data;
//     },
//   });

//   const searchChildCategories = useQuery({
//     queryKey: ["child-category", debounceKeyword],
//     queryFn: async () => {
//       const res = await api.get(
//         `/child-category?search=${debounceKeyword}`
//       );
//       return res.data;
//     },
//   });

//   return {
//     getChildCategories,
//     searchChildCategories,
//   };
// }

import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useChildCategory(query) {
  const [debounceKeyword, setDebounceKeyword] = useState(query);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceKeyword(query);
    }, 600);
    return () => clearTimeout(handler);
  }, [query]);

  // === GET child categories ===
  const getChildCategories = useQuery({
    queryKey: ["child-category"],
    queryFn: async () => {
      const res = await api.get(`/child-category?page=1&limit=20`);
      return res.data;
    },
  });

  const searchChildCategories = useQuery({
    queryKey: ["child-category", debounceKeyword],
    queryFn: async () => {
      const res = await api.get(`/child-category?search=${debounceKeyword}`);
      return res.data;
    },
  });

  // === CREATE ===
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/child-category`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Child category created");
        queryClient.invalidateQueries(["child-category"]);
      }
    },
    onError: () => toast.error("Create failed"),
  });

  // === UPDATE ===
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/child-category/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Child category updated");
        queryClient.invalidateQueries(["child-category"]);
      }
    },
    onError: () => toast.error("Update failed"),
  });

  // === DELETE ===
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/child-category/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Child category deleted");
        queryClient.invalidateQueries(["child-category"]);
      }
    },
    onError: () => toast.error("Delete failed"),
  });

  return {
    getChildCategories,
    searchChildCategories,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
