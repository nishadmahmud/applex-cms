import { apiSlice } from "../apiSlice";

export const profitLossReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfitLossReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/profit-loss-report",
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["ProfitLossReport"],
    }),
  }),
});

export const { useGetProfitLossReportQuery } = profitLossReportApi;
