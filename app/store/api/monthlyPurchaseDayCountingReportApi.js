import { apiSlice } from "../apiSlice";

export const monthlyPurchaseDayCountingReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseSummaryReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/purchase-summary-report",
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["PurchaseSummary"],
    }),
  }),
});

export const { useGetPurchaseSummaryReportQuery } =
  monthlyPurchaseDayCountingReportApi;
