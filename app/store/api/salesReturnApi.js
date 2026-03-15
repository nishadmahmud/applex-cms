import { apiSlice } from "../apiSlice";

export const salesReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // === Sales Return List ===
    getSalesReturnList: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `sales-return-list?page=${page}&limit=${limit}`,
      providesTags: ["SalesReturn"],
    }),

    searchSalesReturn: builder.query({
      query: ({ search = "", page = 1, limit = 20 }) =>
        `sales-return-search?search=${search}&page=${page}&limit=${limit}`,
      providesTags: ["SalesReturn"],
    }),

    // === Invoices ===
    getInvoices: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `invoice-list?page=${page}&limit=${limit}`,
    }),

    searchInvoice: builder.mutation({
      query: (payload) => ({
        url: "search-invoice",
        method: "POST",
        body: payload, // { keyword, product_id }
      }),
    }),

    // === Products ===
    getProducts: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `product?page=${page}&limit=${limit}`,
    }),

    searchProducts: builder.mutation({
      query: (payload) => ({
        url: "search-product-v1?page=1&limit=20",
        method: "POST",
        body: payload, // { keyword }
      }),
    }),

    // === Payment Methods and Actions ===
    getPaymentMethods: builder.query({
      query: () => `payment-type-list`,
    }),

    saveSalesReturn: builder.mutation({
      query: (payload) => ({
        url: "save-sales-return",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SalesReturn"],
    }),

    // --- NEW MUTATION ---
    changeSalesReturnStatus: builder.mutation({
      query: (payload) => ({
        url: "change-sales-return-invoice-status",
        method: "POST",
        body: payload, // { return_id: "..." }
      }),
      invalidatesTags: ["SalesReturn"], // Automatically refetches the list on success
    }),

    deleteSalesReturn: builder.mutation({
      query: (id) => ({
        url: `delete-sales-return/${id}`,
        method: "GET", // Note: The convention is typically 'DELETE', but following your provided API.
      }),
      invalidatesTags: ["SalesReturn"], // Ensures list is refetched after deletion
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSalesReturnListQuery,
  useSearchSalesReturnQuery,
  useGetInvoicesQuery,
  useSearchInvoiceMutation,
  useGetProductsQuery,
  useSearchProductsMutation,
  useGetPaymentMethodsQuery,
  useSaveSalesReturnMutation,
  useDeleteSalesReturnMutation,
  // --- EXPORT NEW HOOK ---
  useChangeSalesReturnStatusMutation,
} = salesReturnApi;
