// import { apiSlice } from "../apiSlice";

// export const customerReviewApi = apiSlice.injectEndpoints({
//   endpoints: (builder) => ({
//     // === Get Reviews for a Seller (Paginated) ===
//     getSellerReviews: builder.query({
//       query: ({ userId, page = 1 }) =>
//         `get-sellerwise-reviews/${userId}?page=${page}`,
//       // The response structure you provided is data.data and data.pagination
//       transformResponse: (response) => ({
//         reviews: response.data,
//         pagination: response.pagination,
//       }),
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.reviews.map(({ id }) => ({ type: "Reviews", id })),
//               { type: "Reviews", id: "LIST" },
//             ]
//           : [{ type: "Reviews", id: "LIST" }],
//     }),

//     // === Approve a Review ===
//     approveReview: builder.mutation({
//       query: (payload) => ({
//         url: `approve-review`,
//         method: "POST",
//         body: payload, // { id: review_id }
//       }),
//       // Invalidate the list to refetch it after a review is approved
//       invalidatesTags: (result, error, { id }) => [{ type: "Reviews", id }],
//     }),
//   }),
// });

// export const { useGetSellerReviewsQuery, useApproveReviewMutation } =
//   customerReviewApi;

import { apiSlice } from "../apiSlice";

export const customerReviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ======== Fetch Seller-wise Reviews =========
    getSellerReviews: builder.query({
      query: ({ userId, page = 1, limit = 10 }) =>
        `get-sellerwise-reviews/${userId}?page=${page}&limit=${limit}`,
      providesTags: ["Reviews"],
    }),

    // ======== Approve Review =========
    approveReview: builder.mutation({
      query: (payload) => ({
        url: "approve-review",
        method: "POST",
        body: payload, // { id: review_id }
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const { useGetSellerReviewsQuery, useApproveReviewMutation } =
  customerReviewApi;
