import { apiSlice } from "../apiSlice";

export const deliveryApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getDeliveryList : builder.query({
            query : ({page,limit}) => `delivery-method-list?page=${page}&limit=${limit}`,
            providesTags : ['DeliveryList'],
        }),
        getDeliveryInfoList : builder.query({
            query : () => `delivery-info-list`,
            providesTags : ['DeliveryInfoList'],
        }),
        deliveryMethodSave : builder.mutation({
            query : (payload) => ({
                url : 'delivery-method-save',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
        editDeliveryMethod : builder.mutation({
            query : (payload) => ({
                url : 'delivery-method-update',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
        deliveryInfoSave : builder.mutation({
            query : (payload) => ({
                url : 'delivery-info-save',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
        editDeliveryInfo : builder.mutation({
            query : (payload) => ({
                url : 'delivery-info-update',
                method : 'POST',
                body : payload
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
        deleteDeliveryInfo : builder.mutation({
            query : (deliveryinfoId) => ({
                url : 'delete-delivery-info',
                method : 'POST',
                body : deliveryinfoId
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
        deleteDeliveryMethod : builder.mutation({
            query : (deliverymethodId) => ({
                url : 'delete-delivery-method',
                method : 'POST',
                body : deliverymethodId
            }),
            invalidatesTags : ['DeliveryInfoList','DeliveryList'],
        }),
    })
})


export const {useGetDeliveryListQuery,useGetDeliveryInfoListQuery,useDeliveryMethodSaveMutation,useDeliveryInfoSaveMutation,useDeleteDeliveryMethodMutation,useEditDeliveryInfoMutation,useDeleteDeliveryInfoMutation,useEditDeliveryMethodMutation} = deliveryApi;