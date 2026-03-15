
import { apiSlice } from "../apiSlice";


export const saleCustomerApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getCustomerList: builder.query({
            query: ({ page, limit }) => `/customer-lists?page=${page}&limit=${limit}`,
            providesTags: ['SaleCustomerList']
        }),
        searchCustomer: builder.query({
            query: (keyword) => ({
                url: '/search-customer?page=1&limit=10',
                method: 'POST',
                body: { keyword }
            }),
            providesTags: ['SearchCustomer']
        }),
        getCustomerProfile: builder.query({
            query: ({ id, interval }) => ({
                url: `/customer-profile/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['CustomerProfile']
        }),
        getCustomerDetails: builder.query({
            query: ({ id }) => ({
                url: `/customer-details/${id}`,
                method: "GET"
            }),
            providesTags: ['CustomerDetails']
        }),
        updateCustomerDetails: builder.mutation({
            query: (payload) => ({
                url: '/save-customer',
                method: "POST",
                body: payload
            }),
            invalidatesTags: ['CustomerDetails', 'SaleCustomerList', 'SearchCustomer']
        }),
        getCustomerWiseProduct: builder.query({
            query: ({ id, interval }) => ({
                url: `/customer-wise-product/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['CustomerWiseProduct']
        }),
        getCustomerWiseInvoice: builder.query({
            query: ({ id, interval }) => ({
                url: `/customer-wise-invoice/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['CustomerWiseInvoice']
        })
    })
})


export const { useGetCustomerListQuery, useSearchCustomerQuery, useGetCustomerProfileQuery, useGetCustomerWiseProductQuery, useGetCustomerWiseInvoiceQuery, useGetCustomerDetailsQuery, useUpdateCustomerDetailsMutation } = saleCustomerApi;