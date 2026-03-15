import { apiSlice } from "../apiSlice";

export const allSellInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchInvoice: builder.mutation({
      query: ({ token, page, limit, payload }) => ({
        url: `/search-invoice?page=${page}&limit=${limit}`,
        method: "POST",
        body: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["AllSellInvoice"],
    }),
  }),
  overrideExisting: true,
});

export const { useSearchInvoiceMutation } = allSellInvoiceApi;
