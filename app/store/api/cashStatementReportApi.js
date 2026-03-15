import { apiSlice } from "../apiSlice"

export const cashStatementReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashStatementReport: builder.query({
      // params: { start_date, end_date }
      query: ({ start_date, end_date }) => ({
        url: `/cash-statement-report`,
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["CashStatementReport"],
    }),
  }),
})

export const { useGetCashStatementReportQuery } = cashStatementReportApi
