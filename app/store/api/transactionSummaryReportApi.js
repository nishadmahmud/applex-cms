import { apiSlice } from "../apiSlice";

export const transactionSummaryReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashBookReport: builder.query({
      query: ({ start_date, end_date, view_order = "asc" }) => ({
        url: "/cash-book-report",
        method: "POST",
        body: { start_date, end_date, view_order },
      }),
      providesTags: ["CashBookReport"],
    }),
  }),
});

export const { useGetCashBookReportQuery } = transactionSummaryReportApi;
