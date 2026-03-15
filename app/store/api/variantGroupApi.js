import { apiSlice } from "../apiSlice";

export const variantGroupApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Get all variant groups ===
    getVariantGroups: builder.query({
      query: () => `variant-groups`,
      providesTags: ["VariantGroups"],
    }),

    // === Save or update variant group ===
    saveVariantGroup: builder.mutation({
      query: (payload) => ({
        url: "save-variant-groups",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["VariantGroups"],
    }),

    // === Delete variant group ===
    deleteVariantGroup: builder.mutation({
      query: (id) => ({
        url: `delete-variant-group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VariantGroups"],
    }),
  }),
});

export const {
  useGetVariantGroupsQuery,
  useSaveVariantGroupMutation,
  useDeleteVariantGroupMutation,
} = variantGroupApi;
