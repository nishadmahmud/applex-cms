// app/store/api/allWholeSaleInvoiceApi.js
import { apiSlice } from "../apiSlice";

export const allWholeSaleInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 load invoice list initially
    getWholeSaleInvoiceList: builder.query({
      query: ({ token, page, limit }) => ({
        url: `/invoice-list?sales_type=wholesale&page=${page}&limit=${limit}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["AllWholeSaleInvoice"],
    }),

    // 🔹 search invoices with filters
    searchWholeSaleInvoice: builder.mutation({
      query: ({ token, page, limit, payload }) => ({
        url: `/search-invoice?page=${page}&limit=${limit}`,
        method: "POST",
        body: { ...payload, sales_type: "wholesale" },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["AllWholeSaleInvoice"],
    }),
  }),
});

export const {
  useGetWholeSaleInvoiceListQuery,
  useSearchWholeSaleInvoiceMutation,
} = allWholeSaleInvoiceApi;
