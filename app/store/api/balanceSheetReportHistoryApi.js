import { apiSlice } from "../apiSlice";

export const balanceSheetReportHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBalanceSheetReportHistory: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/balance-Sheet-report-history",
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["BalanceSheetReportHistory"],
    }),
  }),
});

export const { useGetBalanceSheetReportHistoryQuery } =
  balanceSheetReportHistoryApi;
