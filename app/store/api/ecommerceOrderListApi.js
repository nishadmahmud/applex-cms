import { apiSlice } from "../apiSlice";

export const ecommerceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ limit = 20, page = 1, type }) => ({
        url: "/order-list",
        method: "POST",
        body: { limit, page, type },
      }),
      providesTags: ["EcommerceOrders"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ invoice_id, status }) => ({
        url: "/update-ecommerce-status",
        method: "POST",
        body: { invoice_id, status },
      }),
      invalidatesTags: ["EcommerceOrders"],
    }),

    searchInvoices: builder.query({
      query: ({ keyword, start_date, end_date, page = 1 }) => ({
        url: "/search-ecommerce-invoice",
        method: "POST",
        body: { keyword, start_date, end_date },
      }),
      providesTags: ["EcommerceOrders"],
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/delete-sale/${orderId}`,
        method: "GET",
      }),
      invalidatesTags: ["EcommerceOrders"],
    }),

    // ✨ Update Ecommerce Sale
    updateEcommerceSales: builder.mutation({
      query: (payload) => ({
        url: "/update-ecommerce-sales",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["EcommerceOrders"],
    }),

    // ✨ Create Pathao Order (called only if selected method is Pathao)
    createPathaoOrder: builder.mutation({
      query: (payload) => ({
        url: "/pathao/create-order",
        method: "POST",
        body: payload,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useSearchInvoicesQuery,
  useDeleteOrderMutation,
  useUpdateEcommerceSalesMutation,
  useCreatePathaoOrderMutation, // <-- new export
} = ecommerceApi;
