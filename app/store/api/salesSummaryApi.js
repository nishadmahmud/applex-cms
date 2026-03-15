import { apiSlice } from "../apiSlice";

export const salesSummaryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesSummaryReport: builder.query({
      query: ({
        start_date,
        end_date,
        filter = "IMEI",
        brand_id = "",
        status = "",
      }) => ({
        url: "/sale-summary-report",
        method: "POST",
        body: {
          start_date,
          end_date,
          filter,
          brand_id,
          ...(status !== "" ? { status: Number(status) } : {}),
        },
      }),
      providesTags: ["SalesSummary"],
    }),
    getSalesSummaryBrands: builder.query({
      query: ({ page = 1, limit = 100 }) =>
        `/brands?page=${page}&limit=${limit}`,
      providesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetSalesSummaryReportQuery,
  useGetSalesSummaryBrandsQuery,
} = salesSummaryApi;
