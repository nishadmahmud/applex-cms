import { apiSlice } from "../apiSlice";

export const monthWiseReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMonthWiseReport: builder.query({
      query: ({ selected_month, selected_year }) => ({
        url: "/month-wise-report",
        method: "POST",
        body: { selected_month, selected_year },
      }),
      providesTags: ["MonthWiseReport"],
    }),
  }),
});

export const { useGetMonthWiseReportQuery } = monthWiseReportApi;
