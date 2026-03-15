import { apiSlice } from "../apiSlice";

export const customerSummaryReportApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Main report
    getCustomerSummaryReport: builder.query({
      query: ({ start_date, end_date, customer_id }) => ({
        url: "/customer-summary",
        method: "POST",
        body: { start_date, end_date, customer_id },
      }),
      providesTags: ["CustomerSummaryReport"],
    }),

    // Customers: default list
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/customer-lists?page=${page}&limit=${limit}`,
      providesTags: ["Customers"],
    }),

    // Customers: search
    searchCustomers: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-customer?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["CustomersSearch"],
    }),
  }),
});

export const {
  useGetCustomerSummaryReportQuery,
  useGetCustomersQuery,
  useSearchCustomersQuery,
  useLazySearchCustomersQuery,
} = customerSummaryReportApi;
