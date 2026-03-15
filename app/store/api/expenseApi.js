import { apiSlice } from "../apiSlice";

export const expenseApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getExpenseList : builder.query({
            query : () => 'get-expense',
            providesTags : ['ExpenseList']
        }),
        getExpenseTypeList : builder.query({
            query : () => 'get-expense-type-list',
            providesTags : ['ExpenseTypeList']
        }),
        addExpenseType : builder.mutation({
            query : (payload) => ({
                url : 'save-expense-type',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['ExpenseTypeList','PaymentExpenseTypeList']
        }),
        editExpenseType : builder.mutation({
            query : ({id,payload}) => ({
                url : `update-expense-type/${id}`,
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['ExpenseTypeList','PaymentExpenseTypeList']
        }),
        deleteExpenseType : builder.mutation({
            query : (id) => ({
                url : 'delete-expense-type',
                method : 'POST',
                body : id
            }),
            invalidatesTags : ['ExpenseTypeList','PaymentExpenseTypeList']
        }),
        addExpense : builder.mutation({
            query : (payload) => ({
                url : `save-expense`,
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['ExpenseList','PaymentExpenseList']
        }),
        editExpenseList : builder.mutation({
            query : ({id,payload}) => ({
                url : `update-expense/${id}`,
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['ExpenseList','PaymentExpenseList']
        }),
        deleteExpense : builder.mutation({
            query : (id) => ({
                url : 'delete-expense',
                method : 'POST',
                body : id
            }),
            invalidatesTags : ['ExpenseList','PaymentExpenseList']
        }),
        getTransactionStatuses : builder.query({
            query : () => 'get-transaction-statuses',
            invalidatesTags : ['ExpenseList']
        })
    })
})


export const {useGetExpenseListQuery,useGetExpenseTypeListQuery,useEditExpenseListMutation,useDeleteExpenseMutation,useAddExpenseMutation,useGetTransactionStatusesQuery,useAddExpenseTypeMutation,useDeleteExpenseTypeMutation,useEditExpenseTypeMutation} = expenseApi; 