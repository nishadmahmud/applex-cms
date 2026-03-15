import { apiSlice } from "../apiSlice";

export const accountingHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccountingHistory: builder.query({
      // params: { from_date, to_date, page=1, limit=50 }
      query: ({ from_date, to_date, page = 1, limit = 50 }) => ({
        url: `/search-transaction?page=${page}&limit=${limit}`,
        method: "POST",
        body: {
          from_date,
          to_date,
          limit,
        },
      }),
      providesTags: ["AccountingHistory"],
    }),
  }),
});

export const { useGetAccountingHistoryQuery } = accountingHistoryApi;
