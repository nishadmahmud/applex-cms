import { apiSlice } from "../apiSlice";

export const expenseTypeWiseReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main report
    getExpenseTypeWiseReport: builder.query({
      query: ({ start_date, end_date, expense_type_id }) => {
        const body = { start_date, end_date };
        if (expense_type_id && expense_type_id !== "all") {
          body.expense_type_id = Number(expense_type_id);
        }
        return {
          url: "/expense-type-wise-report",
          method: "POST",
          body,
        };
      },
      providesTags: ["ExpenseTypeWiseReport"],
    }),

    // Expense types: default list
    getExpenseTypesAll: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/expense-type-list-all?page=${page}&limit=${limit}`,
      providesTags: ["ExpenseTypes"],
    }),

    // Expense types: search
    searchExpenseTypes: builder.query({
      query: ({ keyword = "", page = 1, limit = 10 }) => ({
        url: `/search-expense-type?page=${page}&limit=${limit}`,
        method: "POST",
        body: { keyword },
      }),
      providesTags: ["ExpenseTypesSearch"],
    }),
  }),
});

export const {
  useGetExpenseTypeWiseReportQuery,
  useGetExpenseTypesAllQuery,
  useSearchExpenseTypesQuery,
  useLazySearchExpenseTypesQuery,
} = expenseTypeWiseReportApi;
