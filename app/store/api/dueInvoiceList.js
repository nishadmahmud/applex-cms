import { apiSlice } from "../apiSlice";

const dueInvoiceList = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerDueInvoiceList: builder.query({
      query: ({ id }) => `customer-due-invoice-list/${id}`,
      providesTags: ["CustomerDueInvoiceList"],
    }),
    getCustomerDueCollection: builder.query({
      query: ({ id }) => `customer-due-collection/${id}`,
      providesTags: ["CustomerDueCollection"],
    }),
    getVendorDueInvoiceList: builder.query({
      query: ({ id }) => `vendor-due-invoice-list/${id}`,
      providesTags: ["VendorDueInvoiceList"],
    }),
    getVendorDueCollection: builder.query({
      query: ({ id }) => `vendor-due-collection/${id}`,
      providesTags: ["VendorDueCollection"],
    }),
    updateDueInvoice: builder.mutation({
      query: (payload) => ({
        url: `update-due-collection/${payload.id}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        "CustomerDueCollection",
        "CustomerProfile",
        "VendorDueCollection",
        "VendorProfile",
      ],
    }),
    updateDueCollection: builder.mutation({
      query: (dueSchema) => ({
        url: "due-collection",
        method: "POST",
        body: dueSchema,
      }),
      invalidatesTags: [
        "CustomerDueInvoiceList",
        "CustomerProfile",
        "CustomerDueCollection",
        "VendorDueInvoiceList",
        "VendorProfile",
        "VendorDueCollection",
      ],
    }),
    saveAdvanceDue: builder.mutation({
      query: (payload) => ({
        url: "save-advance-due",
        method: "POST",
        body: payload,
      }),
    }),
    dueDiscount: builder.mutation({
      query: (payload) => ({
        url: "save-due-discount",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["CustomerProfile", "VendorProfile"],
    }),
  }),
});

export const {
  useGetCustomerDueInvoiceListQuery,
  useGetCustomerDueCollectionQuery,
  useUpdateDueInvoiceMutation,
  useUpdateDueCollectionMutation,
  useSaveAdvanceDueMutation,
  useDueDiscountMutation,
  useGetVendorDueInvoiceListQuery,
  useGetVendorDueCollectionQuery,
} = dueInvoiceList;
