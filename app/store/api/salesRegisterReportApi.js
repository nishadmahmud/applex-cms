import { apiSlice } from "../apiSlice";

export const salesRegisterReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesRegisterReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/sales-register",
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["SalesRegisterReport"],
    }),
  }),
});

export const { useGetSalesRegisterReportQuery } = salesRegisterReportApi;
