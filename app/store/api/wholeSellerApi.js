// app/store/api/wholeSellerApi.js
import { apiSlice } from "../apiSlice";

export const wholeSellerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Paginated list or search (same endpoint works for both)
    getWholeSellerList: builder.query({
      query: ({ page = 1, per_page = 20, keyword = "" }) => ({
        url: `/search-whole-seller?page=${page}&per_page=${per_page}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["WholeSellerList"],
    }),
    searchWholeSeller: builder.query({
      query: (keyword) => ({
        url: "/search-whole-seller?page=1&per_page=20",
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["WholeSellerList"],
    }),
    saveWholeSeller: builder.mutation({
      query: (payload) => ({
        url: "/save-whole-seller",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["WholeSellerList"],
    }),
  }),
});

export const {
  useGetWholeSellerListQuery,
  useSearchWholeSellerQuery,
  useSaveWholeSellerMutation,
} = wholeSellerApi;
