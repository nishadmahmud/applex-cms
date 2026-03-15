"use client";
import { apiSlice } from "@/app/store/apiSlice";

export const cancelInvoiceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        searchCancelInvoice: builder.mutation({
            query: ({ page, limit, payload, token }) => ({
                url: `/search-cancel-invoice?page=${page}&limit=${limit}`,
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: payload,
            }),
        }),
    }),
});

export const { useSearchCancelInvoiceMutation } = cancelInvoiceApi;
