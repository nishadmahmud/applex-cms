import { apiSlice } from "../apiSlice";

export const purchaseReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Purchase Return List ===
    getPurchaseReturnList: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `purchase-return-list?page=${page}&limit=${limit}`,
      providesTags: ["PurchaseReturn"],
    }),

    searchPurchaseReturn: builder.query({
      query: ({ search = "", page = 1, limit = 20 }) =>
        `purchase-return-search?search=${search}&page=${page}&limit=${limit}`,
      providesTags: ["PurchaseReturn"],
    }),

    // === Purchase Invoices ===
    getPurchaseInvoices: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `purchase-invoice-list?page=${page}&limit=${limit}`,
    }),

    searchPurchaseInvoice: builder.mutation({
      query: (payload) => ({
        url: "search-purchase-invoice",
        method: "POST",
        body: payload, // { keyword, product_id }
      }),
    }),

    // === Products ===
    getPurchaseProducts: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `product?page=${page}&limit=${limit}`,
    }),

    searchPurchaseProducts: builder.mutation({
      query: (payload) => ({
        url: "search-product-v1?page=1&limit=20",
        method: "POST",
        body: payload,
      }),
    }),

    // === Payment Methods ===
    getPurchasePaymentMethods: builder.query({
      query: () => `payment-type-list`,
    }),

    // === Save Purchase Return ===
    savePurchaseReturn: builder.mutation({
      query: (payload) => ({
        url: "save-purchase-return",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),

    // === Change Status ===
    changePurchaseReturnStatus: builder.mutation({
      query: (payload) => ({
        url: "change-purchase-return-status",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),

    // === Delete ===
    deletePurchaseReturn: builder.mutation({
      query: (id) => ({
        url: `delete-purchase-return/${id}`,
        method: "GET",
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),
  }),
});

export const {
  useGetPurchaseReturnListQuery,
  useSearchPurchaseReturnQuery,
  useGetPurchaseInvoicesQuery,
  useSearchPurchaseInvoiceMutation,
  useGetPurchaseProductsQuery,
  useSearchPurchaseProductsMutation,
  useGetPurchasePaymentMethodsQuery,
  useSavePurchaseReturnMutation,
  useChangePurchaseReturnStatusMutation,
  useDeletePurchaseReturnMutation,
} = purchaseReturnApi;
