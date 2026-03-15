import { apiSlice } from "../apiSlice";

export const tagsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tags
    getTags: builder.query({
      query: () => "/tags",
      providesTags: ["Tag"],
    }),

    // Create new tags (bulk)
    saveTags: builder.mutation({
      query: (payload) => ({
        url: "/tags",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Tag"],
    }),

    // Update existing tag
    updateTag: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/tags/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Tag"],
    }),

    // Delete a tag
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/tags/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tag"],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useSaveTagsMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsApi;
