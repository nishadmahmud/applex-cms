import { apiSlice } from "../apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard data with interval filter
    getDashboardData: builder.query({
      query: ({ interval = "yearly" } = {}) =>
        `/web-dashboard?interval=${interval}`,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
