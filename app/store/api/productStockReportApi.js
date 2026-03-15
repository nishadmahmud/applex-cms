import { apiSlice } from "../apiSlice";

export const productStockReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductStockReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/date-wise-product-stock-report-list",
        method: "POST",
        body: {
          start_date,
          end_date,
        },
      }),
      providesTags: ["ProductStockReport"],
    }),
  }),
});

export const { useGetProductStockReportQuery } = productStockReportApi;
