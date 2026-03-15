import { apiSlice } from "../apiSlice";

export const cashBookReportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashBookReport: builder.query({
      query: ({
        start_date,
        end_date,
        view_order = "asc",
        payment_type_id,
      }) => {
        const body = {
          start_date,
          end_date,
          view_order, // "asc" or "desc"
        };
        if (payment_type_id && payment_type_id !== "all") {
          body.payment_type_id = Number(payment_type_id);
        }
        return {
          url: "/cash-book-report",
          method: "POST",
          body,
        };
      },
      providesTags: ["CashBookReport"],
    }),

    getPaymentTypes: builder.query({
      query: ({ page = 1, limit = 100 } = {}) =>
        `/payment-type-list?page=${page}&limit=${limit}`,
      providesTags: ["PaymentTypes"],
    }),
  }),
});

export const { useGetCashBookReportQuery, useGetPaymentTypesQuery } =
  cashBookReportApi;
