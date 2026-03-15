import { apiSlice } from "../apiSlice";

export const dueReportHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Date-wise Due List
    getDateWiseDueList: builder.query({
      query: ({ start_date, end_date, due }) => ({
        url: "/date-wise-due-list",
        method: "POST",
        body: { start_date, end_date, due },
      }),
      providesTags: ["DateWiseDueHistory"],
    }),
  }),
});

export const { useGetDateWiseDueListQuery } = dueReportHistoryApi;
