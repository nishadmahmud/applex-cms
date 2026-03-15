import { apiSlice } from "../apiSlice";

export const categoryStockReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryStockReportDateWise: builder.query({
      // Accepts { page, limit, start_date, end_date }
      query: ({ page = 1, limit = 500, start_date = "", end_date = "" }) => ({
        url: `/category-stock-report-date-wise?page=${page}&limit=${limit}`,
        method: "POST",
        body: {
          // Dates optional; send if present
          start_date,
          end_date,
        },
      }),
      providesTags: ["CategoryStockReportDateWise"],
    }),
  }),
});

export const { useGetCategoryStockReportDateWiseQuery } =
  categoryStockReportApi;
