import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// This API uses the public outlet endpoint — send token as instructed
export const orderBucketApi = createApi({
    reducerPath: "orderBucketApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://outlet.outletexpense.com/api/public",
    }),
    tagTypes: ["OrderBucket"],
    endpoints: (builder) => ({
        searchCustomerBasket: builder.mutation({
            query: ({ payload, token }) => ({
                url: "/search-customer-basket",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: payload,
            }),
        }),
    }),
});

export const { useSearchCustomerBasketMutation } = orderBucketApi;
