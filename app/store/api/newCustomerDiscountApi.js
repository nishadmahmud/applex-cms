import { apiSlice } from "../apiSlice";

export const newCustomerDiscountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNewCustomerDiscounts: builder.query({
      query: () => "/new-customer-discount",
      providesTags: ["NewCustomerDiscount"],
    }),

    saveNewCustomerDiscount: builder.mutation({
      query: (payload) => ({
        url: "/new-customer-discount",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["NewCustomerDiscount"],
    }),

    deleteNewCustomerDiscount: builder.mutation({
      query: (id) => ({
        url: `/new-customer-discount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["NewCustomerDiscount"],
    }),
  }),
});

export const {
  useGetNewCustomerDiscountsQuery,
  useSaveNewCustomerDiscountMutation,
  useDeleteNewCustomerDiscountMutation,
} = newCustomerDiscountApi;
