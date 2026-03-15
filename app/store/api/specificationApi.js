import { apiSlice } from "../apiSlice";

export const specificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Retrieve all specifications (paginated) ===
    getSpecifications: builder.query({
      query: ({ search = "", per_page = 10, page = 1 } = {}) =>
        `specifications?search=${search}&per_page=${per_page}&page=${page}`,
      providesTags: ["Specifications"],
    }),

    // === Save / Update specification (POST same URL) ===
    saveSpecification: builder.mutation({
      query: (payload) => ({
        url: "save-specifications",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Specifications"],
    }),

    // === Delete ===
    deleteSpecification: builder.mutation({
      query: (id) => ({
        url: `delete-specifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Specifications"],
    }),
  }),
});

export const {
  useGetSpecificationsQuery,
  useSaveSpecificationMutation,
  useDeleteSpecificationMutation,
} = specificationApi;
