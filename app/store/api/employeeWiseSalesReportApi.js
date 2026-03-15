import { apiSlice } from "../apiSlice";

export const employeeWiseSalesReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Employee-wise sales
    getEmployeeWiseSales: builder.query({
      query: ({ start_date, end_date, employee_id }) => ({
        url: "/employee-wise-sales",
        method: "POST",
        body: { start_date, end_date, employee_id },
      }),
      providesTags: ["EmployeeWiseSales"],
    }),

    // Employees for dropdown (default list)
    getEmployees: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/employee?page=${page}&limit=${limit}`,
      providesTags: ["Employees"],
    }),

    // Search employees
    searchEmployees: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-employee?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["EmployeesSearch"],
    }),
  }),
});

export const {
  useGetEmployeeWiseSalesQuery,
  useGetEmployeesQuery,
  useSearchEmployeesQuery,
  useLazySearchEmployeesQuery,
} = employeeWiseSalesReportApi;
