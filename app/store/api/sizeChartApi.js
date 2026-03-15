import { apiSlice } from "../apiSlice";

export const sizeChartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Retrieve all size charts ===
    getSizeCharts: builder.query({
      query: ({ search = "", per_page = 10, page = 1 } = {}) =>
        `size-charts?search=${search}&per_page=${per_page}&page=${page}`,
      providesTags: ["SizeCharts"],
    }),

    // === Save / Update size chart (POST same URL) ===
    saveSizeChart: builder.mutation({
      query: (payload) => ({
        url: "save-size-chart",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SizeCharts"],
    }),

    // === Delete ===
    deleteSizeChart: builder.mutation({
      query: (id) => ({
        url: `delete-size-chart-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SizeCharts"],
    }),
  }),
});

export const {
  useGetSizeChartsQuery,
  useSaveSizeChartMutation,
  useDeleteSizeChartMutation,
} = sizeChartApi;
