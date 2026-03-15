import { apiSlice } from "../apiSlice";

export const salesQuantityReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesQuantityReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/sales-quantity-report",
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["SalesQuantityReport"],
    }),
  }),
});

export const { useGetSalesQuantityReportQuery } = salesQuantityReportApi;
