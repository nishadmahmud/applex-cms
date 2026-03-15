import { apiSlice } from "../apiSlice";

export const holdInvoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHoldInvoiceList: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/hold-list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["HoldInvoice"],
    }),

    // 🆕 new: search hold invoices by keyword and filters
    searchHoldInvoices: builder.mutation({
      query: (body) => ({
        url: `/search-hold-invoice?page=${body.page || 1}&limit=${
          body.limit || 10
        }`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HoldInvoice"],
    }),

    deleteHoldInvoice: builder.mutation({
      query: ({ id }) => ({
        url: `/delete-sale/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["HoldInvoice"],
    }),

    cancelHoldInvoice: builder.mutation({
      query: (body) => ({
        url: `/change-invoice-status`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HoldInvoice"],
    })
  }),
});

export const {
  useGetHoldInvoiceListQuery,
  useDeleteHoldInvoiceMutation,
  useCancelHoldInvoiceMutation,
  useSearchHoldInvoicesMutation, // export your new search hook
} = holdInvoicesApi;
