import { apiSlice } from "../apiSlice";

export const quickPaymentApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getPaymentExpenseList : builder.query({
            query : () => 'get-payment-expense',
            providesTags : ['PaymentExpenseList']
        }),
        getPaymentExpenseTypeList : builder.query({
            query : () => 'get-payment-expense-type-list',
            providesTags : ['PaymentExpenseTypeList']
        }),
    })
})


export const {useGetPaymentExpenseListQuery,useGetPaymentExpenseTypeListQuery} = quickPaymentApi;