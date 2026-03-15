import { apiSlice } from "../apiSlice";

export const attributesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all attributes
    getAttributeList: builder.query({
      query: ({ page = 1, limit = 1000 } = {}) =>
        `/attribute-list?page=${page}&limit=${limit}`,
      providesTags: ["Attribute"],
    }),

    // Get specific attribute details
    getAttributeDetails: builder.query({
      query: (id) => `/attribute-details/${id}`,
      providesTags: (result, error, id) => [{ type: "Attribute", id }],
    }),

    // Create new attribute
    saveAttribute: builder.mutation({
      query: (payload) => ({
        url: "/save-attribute",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Attribute"],
    }),

    // Update existing attribute
    updateAttribute: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/update-attribute/${id}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Attribute"],
    }),

    // Delete attribute
    deleteAttribute: builder.mutation({
      query: (id) => ({
        url: `/delete-attribute/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attribute"],
    }),
  }),
});

export const {
  useGetAttributeListQuery,
  useGetAttributeDetailsQuery,
  useSaveAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} = attributesApi;
