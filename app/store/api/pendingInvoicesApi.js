import { apiSlice } from "../apiSlice";

export const pendingInvoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingInvoiceList: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/pending-list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["PendingInvoice"],
    }),

    // 🆕 new: search pending invoices by keyword and filters
    searchPendingInvoices: builder.mutation({
      query: (body) => ({
        url: `/search-pending-invoice?page=${body.page || 1}&limit=${
          body.limit || 10
        }`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PendingInvoice"],
    }),

    completePendingInvoice: builder.mutation({
      query: ({ id }) => ({
        url: `/status-complete`,
        method: "POST",
        body: { sales_id: id },
      }),
      invalidatesTags: ["PendingInvoice"],
    }),
  }),
});

export const {
  useGetPendingInvoiceListQuery,
  useCompletePendingInvoiceMutation,
  useSearchPendingInvoicesMutation, // export your new search hook
} = pendingInvoicesApi;
