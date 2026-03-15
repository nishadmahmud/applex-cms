import { apiSlice } from "../apiSlice";

export const authorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuthors: builder.query({
      // Base URL already includes /api, so we only add /authors
      query: () => "/authors",
      providesTags: ["Author"],
    }),
    createAuthor: builder.mutation({
      query: (payload) => ({
        url: "/authors",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Author"],
    }),
    updateAuthor: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/authors/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Author"],
    }),
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Author"],
    }),
  }),
});

export const {
  useGetAuthorsQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorsApi;

