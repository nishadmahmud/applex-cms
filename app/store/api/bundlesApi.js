import { apiSlice } from "../apiSlice";

export const bundlesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all bundles
    getBundles: builder.query({
      query: () => "/bundles",
      providesTags: ["Bundle"],
    }),

    // Get specific bundle details (if needed)
    getBundleDetails: builder.query({
      query: (id) => `/bundles/${id}`,
      providesTags: (result, error, id) => [{ type: "Bundle", id }],
    }),

    // Create new bundle
    saveBundle: builder.mutation({
      query: (payload) => ({
        url: "/bundles",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Bundle"],
    }),

    // Update existing bundle
    updateBundle: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/bundles/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Bundle"],
    }),

    // Delete a bundle
    deleteBundle: builder.mutation({
      query: (id) => ({
        url: `/bundles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bundle"],
    }),
  }),
});

export const {
  useGetBundlesQuery,
  useGetBundleDetailsQuery,
  useSaveBundleMutation,
  useUpdateBundleMutation,
  useDeleteBundleMutation,
} = bundlesApi;
