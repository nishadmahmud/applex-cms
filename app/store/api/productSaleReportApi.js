import { apiSlice } from "../apiSlice";

export const productSaleReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductSaleReport: builder.query({
      // params: { page=1, limit=500, start_date, end_date }
      query: ({ page = 1, limit = 500, start_date, end_date }) => ({
        url: `/date-wise-product-report-list?page=${page}&limit=${limit}`,
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["ProductSaleReport"],
    }),
  }),
});

export const { useGetProductSaleReportQuery } = productSaleReportApi;
