import { apiSlice } from "../apiSlice";

export const storeLedgerReportApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Store Ledger Report
    getStoreLedgerReport: builder.query({
      query: ({ start_date, end_date, product_id }) => ({
        url: "/store-ledger-report",
        method: "POST",
        body: { start_date, end_date, product_id },
      }),
      providesTags: ["StoreLedgerReport"],
    }),

    // Products (for dropdown default)
    getProducts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/product?page=${page}&limit=${limit}`,
      providesTags: ["Products"],
    }),

    // Search products
    searchProducts: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-product?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["ProductsSearch"],
    }),
  }),
});

export const {
  useGetStoreLedgerReportQuery,
  useGetProductsQuery,
  useLazySearchProductsQuery,
} = storeLedgerReportApi;
