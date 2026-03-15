import { apiSlice } from "../apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query({
      query: ({ page, limit }) =>
        `/get-all-category?page=${page}&limit=${limit}`,
      providesTags: ["Category"],
    }),
    addCategory: builder.mutation({
      query: (payload) => ({
        url: `/save-category`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category"],
    }),
    getSubcategory: builder.query({
      query: ({ page, limit }) => `/sub-category?page=${page}&limit=${limit}`,
      providesTags: ["Subcategory"],
    }),
    addSubcategory: builder.mutation({
      query: (payload) => ({
        url: "/save-sub-category",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category", "Subcategory"],
    }),
    getChildCategory: builder.query({
      query: ({ page, limit }) => `/child-category?page=${page}&limit=${limit}`,
      transformResponse: (response) => response.child_categories,
      providesTags: ["Subcategory", "ChildCategory"],
    }),
    addChildCategory: builder.mutation({
      query: (payload) => ({
        url: "/child-category",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Category", "Subcategory", "ChildCategory"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useAddCategoryMutation,
  useAddSubcategoryMutation,
  useGetSubcategoryQuery,
  useAddChildCategoryMutation,
  useGetChildCategoryQuery,
} = categoryApi;
