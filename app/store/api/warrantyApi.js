// import { apiSlice } from "../apiSlice";

// export const warrantyApi = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     getWarranty: builder.query({
//       query: ({ page, limit }) =>
//         `/get-warranty-list?page=${page}&limit=${limit}`,
//       providesTags: ["Warranty"],
//     }),
//     createWarranty: builder.mutation({
//       query: (payload) => ({
//         url: "/save-warranty",
//         method: "POST",
//         body: payload,
//       }),
//       invalidatesTags: ["Warranty"],
//     }),
//   }),
// });

// export const { useGetWarrantyQuery, useCreateWarrantyMutation } = warrantyApi;

import { apiSlice } from "../apiSlice";

export const warrantyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWarranty: builder.query({
      query: ({ page, limit }) =>
        `/get-warranty-list?page=${page}&limit=${limit}`,
      providesTags: ["Warranty"],
    }),
    createWarranty: builder.mutation({
      query: (payload) => ({
        url: "/save-warranty",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Warranty"],
    }),
    updateWarranty: builder.mutation({
      query: (payload) => ({
        url: `/update-warranty`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Warranty"],
    }),
    // deleteWarranty: builder.mutation({
    //   query: (id) => ({
    //     url: `/delete-warranty/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Warranty"],
    // }),
  }),
});

export const {
  useGetWarrantyQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
} = warrantyApi;
