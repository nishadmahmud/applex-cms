import { apiSlice } from "../apiSlice";

export const salesRegisterDetailsReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesRegisterDetailsReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/sales-register-details",
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["SalesRegisterDetailsReport"],
    }),
  }),
});

export const { useGetSalesRegisterDetailsReportQuery } =
  salesRegisterDetailsReportApi;
