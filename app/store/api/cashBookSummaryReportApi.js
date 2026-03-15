import { apiSlice } from "../apiSlice";

export const cashBookSummaryReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashBookSummaryReport: builder.query({
      query: ({ start_date, end_date, payment_type_id }) => ({
        url: "/cash-book-summary-report",
        method: "POST",
        body: {
          start_date,
          end_date,
          ...(payment_type_id && payment_type_id !== "all"
            ? { payment_type_id: Number(payment_type_id) }
            : {}),
        },
      }),
      providesTags: ["CashBookSummaryReport"],
    }),

    // Payment types list (for filter)
    getPaymentTypes: builder.query({
      query: ({ page = 1, limit = 100 } = {}) =>
        `/payment-type-list?page=${page}&limit=${limit}`,
      providesTags: ["PaymentTypes"],
    }),
  }),
});

export const { useGetCashBookSummaryReportQuery, useGetPaymentTypesQuery } =
  cashBookSummaryReportApi;
