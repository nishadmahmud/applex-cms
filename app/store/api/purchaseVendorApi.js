
import { apiSlice } from "../apiSlice";


export const purchaseVendorApi = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getVendorList: builder.query({
            query: ({ page, limit }) => `/vendor-lists?page=${page}&limit=${limit}`,
            providesTags: ['PurchaseVendorList']
        }),
        searchVendor: builder.query({
            query: (keyword) => ({
                url: '/search-vendor?page=1&limit=10',
                method: 'POST',
                body: { keyword }
            })
        }),
        getVendorProfile: builder.query({
            query: ({ id, interval }) => ({
                url: `/vendor-profile/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['VendorProfile']
        }),
        getVendorDetails: builder.query({
            query: ({ id }) => ({
                url: `/vendor-details/${id}`,
                method: "GET"
            }),
            providesTags: ['VendorDetails']
        }),
        updateVendorDetails: builder.mutation({
            query: (payload) => ({
                url: '/save-vendor',
                method: "POST",
                body: payload
            }),
            invalidatesTags: ['VendorDetails']
        }),
        getVendorWiseProduct: builder.query({
            query: ({ id, interval }) => ({
                url: `/vendor-wise-product/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['VendorWiseProduct']
        }),
        getVendorWiseInvoice: builder.query({
            query: ({ id, interval }) => ({
                url: `/vendor-wise-invoice/${id}?interval=${interval}`,
                method: "GET"
            }),
            providesTags: ['VendorWiseInvoice']
        })
    })
})


export const { useGetVendorListQuery, useSearchVendorQuery, useGetVendorProfileQuery, useGetVendorWiseProductQuery, useGetVendorWiseInvoiceQuery, useGetVendorDetailsQuery, useUpdateVendorDetailsMutation } = purchaseVendorApi;