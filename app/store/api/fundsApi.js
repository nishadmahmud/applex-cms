// store/api/fundsApi.js
import { apiSlice } from "../apiSlice";

export const fundsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentAccounts: builder.query({
      query: () => ({ url: "/payment-type-category-list", method: "GET" }),
      transformResponse: (response) => {
        const list = response?.data?.data ?? [];
        // Ensure numeric amounts
        return list.map((a) => ({
          ...a,
          paymentcategory_sum_payment_amount: Number(
            a.paymentcategory_sum_payment_amount ?? 0
          ),
        }));
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Funds", id })),
              { type: "Funds", id: "LIST" },
            ]
          : [{ type: "Funds", id: "LIST" }],
      refetchOnMountOrArgChange: true,
    }),

    transferFunds: builder.mutation({
      query: (payload) => ({
        url: "/save-fund-transfer",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(
        { account_from, account_to, amount },
        { dispatch, queryFulfilled }
      ) {
        const fromId = Number(account_from);
        const toId = Number(account_to);
        const amt = Number(amount);

        const patch = dispatch(
          fundsApi.util.updateQueryData(
            "getPaymentAccounts",
            undefined,
            (draft) => {
              const fromAcc = draft.find((a) => Number(a.id) === fromId);
              const toAcc = draft.find((a) => Number(a.id) === toId);
              if (fromAcc) {
                fromAcc.paymentcategory_sum_payment_amount =
                  Number(fromAcc.paymentcategory_sum_payment_amount) - amt;
              }
              if (toAcc) {
                toAcc.paymentcategory_sum_payment_amount =
                  Number(toAcc.paymentcategory_sum_payment_amount) + amt;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo(); // rollback on failure
        }
      },
      invalidatesTags: [{ type: "Funds", id: "LIST" }],
    }),

    addBalance: builder.mutation({
      query: (payload) => ({
        url: "/save-balance",
        method: "POST",
        body: payload,
      }),
      async onQueryStarted(
        { account_id, amount },
        { dispatch, queryFulfilled }
      ) {
        const id = Number(account_id);
        const amt = Number(amount);

        const patch = dispatch(
          fundsApi.util.updateQueryData(
            "getPaymentAccounts",
            undefined,
            (draft) => {
              const acc = draft.find((a) => Number(a.id) === id);
              if (acc) {
                acc.paymentcategory_sum_payment_amount =
                  Number(acc.paymentcategory_sum_payment_amount) + amt;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [{ type: "Funds", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPaymentAccountsQuery,
  useTransferFundsMutation,
  useAddBalanceMutation,
} = fundsApi;
