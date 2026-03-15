import { apiSlice } from "../apiSlice";


export const paymentAPi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getPaymentList : builder.query({
            query : () => 'payment-type-list',
            providesTags : ['PaymentList']
        }),
        paymentTypeSave : builder.mutation({
            query : (payload) => ({
                url : 'payment-type-save',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['PaymentList']
        }),
        getPaymentCategoryList : builder.query({
            query : () => 'payment-type-category-list',
            providesTags : ['PaymentCategoryList']
        }),
        paymentTypeCategorySave : builder.mutation({
            query : (payload) => ({
                url : 'payment-type-category-save',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['PaymentList','PaymentCategoryList']
        }),
        editPaymentTypeCategoryList : builder.mutation({
            query : (payload) => ({
                url : 'payment-type-category-update',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['PaymentList','PaymentCategoryList']
        }),
        deletePaymentTypeCategory : builder.mutation({
            query : (paymenttypecategoryId) => ({
                url : 'payment-type-category-delete',
                method : 'POST',
                body : paymenttypecategoryId
            }),
            invalidatesTags : ['PaymentList','PaymentCategoryList']
        }),
        editPaymentType : builder.mutation({
            query : (payload) => ({
                url : 'payment-type-update',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['PaymentList']
        }),
        deletePaymentType : builder.mutation({
            query : (paymenttypeId) => ({
                url : 'payment-type-delete',
                method : 'POST',
                body : paymenttypeId
            }),
            invalidatesTags : ['PaymentList']
        })
    })
})


export const {useGetPaymentListQuery,useGetPaymentCategoryListQuery,useEditPaymentTypeCategoryListMutation,useDeletePaymentTypeMutation,useEditPaymentTypeMutation,usePaymentTypeCategorySaveMutation,useDeletePaymentTypeCategoryMutation,usePaymentTypeSaveMutation} = paymentAPi;