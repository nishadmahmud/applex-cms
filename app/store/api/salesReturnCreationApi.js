import { apiSlice } from "../apiSlice";

export const salesReturnCreationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `/invoice-list?page=${page}&limit=${limit}`,
    }),
    searchInvoice: builder.mutation({
      query: (payload) => ({
        url: "/search-invoice",
        method: "POST",
        body: payload,
      }),
    }),
    getPaymentMethods: builder.query({
      query: () => `/payment-type-list`,
    }),
    saveSalesReturn: builder.mutation({
      query: (payload) => ({
        url: "/save-sales-return",
        method: "POST",
        body: payload,
      }),
    }),
    getInvoiceByConsignmentId: builder.mutation({
      query: (payload) => ({
        url: "/get-invoice-by-cid",
        method: "POST",
        body: payload,
      }),
    }),
    getInvoiceByImei: builder.mutation({
      query: (payload) => ({
        url: "/get-imei-with-imei",
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetInvoicesQuery,
  useSearchInvoiceMutation,
  useGetPaymentMethodsQuery,
  useSaveSalesReturnMutation,
  useGetInvoiceByConsignmentIdMutation,
  useGetInvoiceByImeiMutation,
} = salesReturnCreationApi;
