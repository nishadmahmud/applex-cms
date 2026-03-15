import { apiSlice } from "../apiSlice";

export const customerDueAgingReportApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Main report
    getCustomerDueAgingReport: builder.query({
      query: ({ start_date, end_date, customer_id, limit }) => ({
        url: "/customer-due-aging-report",
        method: "POST",
        body: { start_date, end_date, customer_id, limit },
      }),
      providesTags: ["CustomerDueAgingReport"],
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
  useGetCustomerDueAgingReportQuery,
  useGetCustomersQuery,
  useLazySearchCustomersQuery,
} = customerDueAgingReportApi;
