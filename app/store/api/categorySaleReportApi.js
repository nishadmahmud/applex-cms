import { apiSlice } from "../apiSlice";

export const categorySaleReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Category sale report (date-wise detailed list)
    getCategorySaleReportDateWise: builder.query({
      query: ({ start_date, end_date, page = 1, limit = 500 }) => ({
        url: `/category-sale-report-date-wise?page=${page}&limit=${limit}`,
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["CategorySaleReportDateWise"],
    }),

    // Most selling categories (date-wise)
    getMostSellingCategoryDateWise: builder.query({
      query: ({ start_date, end_date, page = 1, limit = 20 }) => ({
        url: `/category-most-sale-report-date-wise?page=${page}&limit=${limit}`,
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["CategoryMostSaleDateWise"],
    }),
  }),
});

export const {
  useGetCategorySaleReportDateWiseQuery,
  useGetMostSellingCategoryDateWiseQuery,
} = categorySaleReportApi;
