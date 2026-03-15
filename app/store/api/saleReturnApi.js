import { apiSlice } from "../apiSlice";

const salesReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSaleReturnDetails: builder.query({
      query: (id) => `sale_return-invoice-details/${id}`,
      providesTags: ['SaleReturn']
    }),
  }),
});

export const { useGetSaleReturnDetailsQuery } = salesReturnApi;
