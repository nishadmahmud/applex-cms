import { apiSlice } from "../apiSlice";

export const refundApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRefunds: builder.query({
            query: ({ page = 1, limit = 10, payload, token }) => ({
                url: `/refunds?page=${page}&limit=${limit}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            providesTags: ["Refunds"],
        }),

        createRefund: builder.mutation({
            query: ({ payload, token }) => ({
                url: "/customer/refunds",
                method: "POST",
                body: payload,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["Refunds"],
        }),

        updateRefund: builder.mutation({
            query: ({ id, payload, token }) => ({
                url: `/refunds/${id}`,
                method: "PUT",
                body: payload,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["Refunds"],
        }),

        deleteRefund: builder.mutation({
            query: ({ id, token }) => ({
                url: `/refunds/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            invalidatesTags: ["Refunds"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRefundsQuery,
    useCreateRefundMutation,
    useUpdateRefundMutation,
    useDeleteRefundMutation,
} = refundApi;
