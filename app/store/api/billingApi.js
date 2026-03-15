const { apiSlice } = require("../apiSlice");

const billingApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        saveSales : builder.mutation({
            query : (payload) => ({
                url : '/save-sales',
                method : 'POST',
                body : payload
            })
        })
    })
})


export const {useSaveSalesMutation} = billingApi;
