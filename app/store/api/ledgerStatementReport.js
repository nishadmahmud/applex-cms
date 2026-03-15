import { apiSlice } from "../apiSlice";

export const ledgerCustomerVendorApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // -------------------------------------
    // Ledger Statement Report
    // -------------------------------------
    getLedgerStatementReport: builder.query({
      query: ({
        start_date,
        end_date,
        vendor_id = "",
        customer_id = "",
      }) => ({
        url: `/ledger-statement-report`,
        method: "POST",
        body: {
          start_date,
          end_date,
          vendor_id,
          customer_id,
        },
      }),
      providesTags: ["LedgerStatementReport"],
    }),

    // -------------------------------------
    // Customers List
    // -------------------------------------
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/customer-lists?page=${page}&limit=${limit}`,
      providesTags: ["Customer"],
    }),

    // Customer Search
    searchCustomer: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-customer?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["CustomerSearch"],
    }),

    // -------------------------------------
    // Vendors List
    // -------------------------------------
    getVendors: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/vendor-lists?page=${page}&limit=${limit}`,
      providesTags: ["Vendor"],
    }),

    // Vendor Search
    searchVendor: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-vendor?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["VendorSearch"],
    }),
  }),
});

export const {
  useGetLedgerStatementReportQuery,
  useGetCustomersQuery,
  useSearchCustomerQuery,
  useGetVendorsQuery,
  useSearchVendorQuery,
} = ledgerCustomerVendorApi;
