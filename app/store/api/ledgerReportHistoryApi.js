import { apiSlice } from "../apiSlice";

export const ledgerReportHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyLedgerReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/monthly-ledger-report",
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["MonthlyLedgerReport"],
    }),
  }),
});

export const { useGetMonthlyLedgerReportQuery } = ledgerReportHistoryApi;
