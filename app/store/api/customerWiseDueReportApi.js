import { apiSlice } from "../apiSlice";

export const customerWiseDueReportApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCustomerWiseDueList: builder.query({
      query: ({ customer_id }) => ({
        url: "/customer-wise-due-list",
        method: "POST",
        body: { customer_id },
      }),
      providesTags: ["CustomerWiseDue"],
    }),

    // Customers (for dropdown default)
    getCustomers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/customer-lists?page=${page}&limit=${limit}`,
      providesTags: ["Customers"],
    }),

    // Search customers
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
  useGetCustomerWiseDueListQuery,
  useGetCustomersQuery,
  useSearchCustomersQuery,
  useLazySearchCustomersQuery,
} = customerWiseDueReportApi;
