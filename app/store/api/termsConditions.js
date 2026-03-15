
import { apiSlice } from "../apiSlice";

export const TermsConditionsApi = apiSlice.injectEndpoints({
    endpoints : (builder) => ({
        getTerms : builder.query({
            query : () => 'terms-conditions-list',
            providesTags : ['TermsConditions']
        }),
        saveTerms : builder.mutation({
            query : (descriptions) => ({
                url : 'terms-conditions',
                method : 'POST',
                body : descriptions
            }),
            invalidatesTags : ['TermsConditions']
        }),
        deleteTerms : builder.mutation({
            query : ({id}) => ({
                url : 'delete-terms-conditions',
                method : 'POST',
                body : {id : id}
            }),
            invalidatesTags : ['TermsConditions']
        })
    })
})


export const {useGetTermsQuery,useSaveTermsMutation,useDeleteTermsMutation} = TermsConditionsApi;