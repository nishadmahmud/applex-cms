import { apiSlice } from "../apiSlice";

export const purchaseRegisterDetailsReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseRegisterDetailsReport: builder.query({
      query: ({ start_date, end_date }) => ({
        url: "/purchase-register-details",
        method: "POST",
        body: { start_date, end_date },
      }),
      providesTags: ["PurchaseRegisterDetailsReport"],
    }),
  }),
});

export const { useGetPurchaseRegisterDetailsReportQuery } =
  purchaseRegisterDetailsReportApi;
