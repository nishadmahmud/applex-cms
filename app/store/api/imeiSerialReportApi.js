import { apiSlice } from "../apiSlice";

export const imeiSerialReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main report
    getImeiSerialStockReport: builder.query({
      query: ({
        stock_type = "",
        start_date = "",
        end_date = "",
        customer_name = "",
        vendor_name = "",
        product_name = "",
        brand_name = "",
        imei = "",
        product_condition = "",
      }) => ({
        url: "/imei-serial-stock-report",
        method: "POST",
        body: {
          stock_type,
          start_date,
          end_date,
          customer_name,
          vendor_name,
          product_name,
          brand_name,
          imei,
          product_condition,
        },
      }),
      providesTags: ["ImeiSerialReport"],
    }),

    // Customers
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/customer-lists?page=${page}&limit=${limit}`,
      providesTags: ["Customer"],
    }),
    searchCustomer: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-customer?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["CustomerSearch"],
    }),

    // Vendors
    getVendors: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/vendor-lists?page=${page}&limit=${limit}`,
      providesTags: ["Vendor"],
    }),
    searchVendor: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-vendor?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["VendorSearch"],
    }),

    // Products
    getProducts: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/product?page=${page}&limit=${limit}`,
      providesTags: ["Product"],
    }),
    searchImeiProduct: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-product-v1?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["ProductSearch"],
    }),

    // Brands (for filters)
    getImeiBrands: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/brands?page=${page}&limit=${limit}`,
      providesTags: ["Brand"],
    }),
    searchBrand: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-brand?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["BrandSearch"],
    }),
  }),
});

export const {
  useGetImeiSerialStockReportQuery,
  useGetCustomersQuery,
  useSearchCustomerQuery,
  useGetVendorsQuery,
  useSearchVendorQuery,
  useGetProductsQuery,
  useSearchImeiProductQuery,
  useGetImeiBrandsQuery,
  useSearchBrandQuery,

  // Lazy hooks for react-select Async loaders
  useLazySearchCustomerQuery,
  useLazySearchVendorQuery,
  useLazySearchImeiProductQuery,
  useLazySearchBrandQuery,
  useLazyGetImeiSerialStockReportQuery,
} = imeiSerialReportApi;
