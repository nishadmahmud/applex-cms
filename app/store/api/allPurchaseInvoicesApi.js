import { apiSlice } from "../apiSlice";

export const allPurchaseInvoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Search purchase invoices with filters
    searchPurchaseInvoices: builder.mutation({
      query: ({ page = 1, limit = 50, payload }) => ({
        url: `/search-purchase-invoice?page=${page}&limit=${limit}`,
        method: "POST",
        body: payload,
      }),
      providesTags: ["PurchaseInvoice"],
    }),
    getHeldPurchaseInvoices: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `/hold-purchase-invoice-list?page=${page}&limit=${limit}`,
      providesTags: ["HeldPurchaseInvoice"],
    }),
  }),
});

export const {
  useSearchPurchaseInvoicesMutation,
  useGetHeldPurchaseInvoicesQuery,
} = allPurchaseInvoicesApi;
