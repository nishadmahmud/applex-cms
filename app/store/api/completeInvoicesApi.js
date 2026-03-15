import { apiSlice } from "../apiSlice";

export const completeInvoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompleteInvoiceList: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/complete-list?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["CompleteInvoice"],
    }),

    // 🆕 new: search complete invoices by keyword and filters
    searchCompleteInvoices: builder.mutation({
      query: (body) => ({
        url: `/search-complete-invoice?page=${body.page || 1}&limit=${
          body.limit || 10
        }`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CompleteInvoice"],
    }),

    // completeCompleteInvoice: builder.mutation({
    //   query: ({ id }) => ({
    //     url: `/status-complete`,
    //     method: "POST",
    //     body: { sales_id: id },
    //   }),
    //   invalidatesTags: ["CompleteInvoice"],
    // }),
  }),
});

export const {
  useGetCompleteInvoiceListQuery,
  // useCompleteCompleteInvoiceMutation,
  useSearchCompleteInvoicesMutation, // export your new search hook
} = completeInvoicesApi;
