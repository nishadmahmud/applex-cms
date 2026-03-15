// api/allSellInvoiceApi.js
import { apiSlice } from "../apiSlice";

export const allSellInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTermsConditions: builder.query({
      query: () => ({
        url: `/terms-conditions-list`,
        method: "GET",
       
      }),
      providesTags: ["TermsConditions"],
    }),
  }),
});

export const { useGetTermsConditionsQuery } = allSellInvoiceApi;
