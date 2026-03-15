import { apiSlice } from "../apiSlice";

export const brandsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: ({ page, limit }) => `/brands?page=${page}&limit=${limit}`,
      providesTags: ["Brand"],
    }),
    createBrand: builder.mutation({
      query: (payload) => ({
        url: "/save-brand",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Brand"],
    }),
    updateBrand: builder.mutation({
      query: (payload) => ({
        url: "/update-brand",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
} = brandsApi;
