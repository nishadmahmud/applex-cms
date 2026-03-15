import { apiSlice } from "../apiSlice";


export const productsApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getProductDetails : builder.query({
            query : ({id}) => `product-details/${id}`,
            providesTags : ['ProductDetails']
        }),
        searchProduct : builder.query({
            query : (keyword) => ({
                url : 'search-product?page=1&limit=40',
                method : 'POST',
                body : keyword
            })
        })
    })
})

export const {useGetProductDetailsQuery,useLazySearchProductQuery} = productsApi;