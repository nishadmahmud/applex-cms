import { apiSlice } from "../apiSlice";

export const invoiceSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔽 New Endpoints for Invoice Settings
    getInvoiceSettingsApi: builder.query({
      query: () => "/get-invoice-settings",
      providesTags: ["InvoiceSettings"],
    }),
    getInvoiceDeatils: builder.query({
      query: ({ invoice_id }) => {
        const isPurchase = invoice_id?.startsWith("PUR-");
        return {
          url: isPurchase ? "/purchase-invoice-details" : "/invoice-details",
          method: "POST",
          body: { invoice_id },
        };
      },
    }),
    saveInvoiceSettings: builder.mutation({
      query: (payload) => ({
        url: "/save-invoice-settings",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["InvoiceSettings"],
    }),
    shopCategory: builder.query({
      query: () => "/shop-category",
      providesTags: ["ShopCategory"],
    }),
  }),
});

// Export all hooks
export const {
  useGetInvoiceSettingsApiQuery,
  useSaveInvoiceSettingsMutation,
  useShopCategoryQuery,
  useGetInvoiceDeatilsQuery,
} = invoiceSettingsApi;
