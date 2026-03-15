import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const PAYMENT_ACCOUNTS_KEY = ["funds", "accounts"];

export default function useFunds(options = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  // GET accounts summary
  const getPaymentAccounts = useQuery({
    queryKey: PAYMENT_ACCOUNTS_KEY,
    queryFn: async () => {
      const res = await api.get("/payment-type-category-list", {
        headers: { "Cache-Control": "no-cache" },
      });
      // server body looked like: { data: { data: [...] } }
      const raw = res?.data;
      const list = raw?.data?.data ?? raw?.data ?? raw ?? [];
      // normalize number
      return list.map((a) => ({
        ...a,
        paymentcategory_sum_payment_amount: Number(
          a?.paymentcategory_sum_payment_amount ?? 0
        ),
      }));
    },
    enabled,
    // keep old data while refetching, smoother UI
    placeholderData: (prev) => prev,
  });

  // POST transfer funds (optimistic)
  const transferFunds = useMutation({
    mutationFn: async ({ account_from, account_to, amount }) => {
      const payload = {
        account_from: Number(account_from),
        account_to: Number(account_to),
        amount: Number(amount),
      };
      const res = await api.post("/save-fund-transfer", payload);
      return res.data;
    },
    onMutate: async ({ account_from, account_to, amount }) => {
      await queryClient.cancelQueries({ queryKey: PAYMENT_ACCOUNTS_KEY });

      const previousAccounts = queryClient.getQueryData(PAYMENT_ACCOUNTS_KEY);
      const fromId = Number(account_from);
      const toId = Number(account_to);
      const amt = Number(amount);

      if (Array.isArray(previousAccounts)) {
        const next = previousAccounts.map((acc) => {
          if (Number(acc.id) === fromId) {
            return {
              ...acc,
              paymentcategory_sum_payment_amount:
                Number(acc.paymentcategory_sum_payment_amount) - amt,
            };
          }
          if (Number(acc.id) === toId) {
            return {
              ...acc,
              paymentcategory_sum_payment_amount:
                Number(acc.paymentcategory_sum_payment_amount) + amt,
            };
          }
          return acc;
        });

        queryClient.setQueryData(PAYMENT_ACCOUNTS_KEY, next);
      }

      return { previousAccounts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          PAYMENT_ACCOUNTS_KEY,
          context.previousAccounts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNTS_KEY });
    },
  });

  // POST add balance (optimistic)
  const addBalance = useMutation({
    mutationFn: async ({ account_id, payment_type_id, amount, name }) => {
      const payload = {
        account_id: Number(account_id),
        payment_type_id: Number(payment_type_id),
        amount: Number(amount),
        name,
      };
      const res = await api.post("/save-balance", payload);
      return res.data;
    },
    onMutate: async ({ account_id, amount }) => {
      await queryClient.cancelQueries({ queryKey: PAYMENT_ACCOUNTS_KEY });

      const previousAccounts = queryClient.getQueryData(PAYMENT_ACCOUNTS_KEY);
      const id = Number(account_id);
      const amt = Number(amount);

      if (Array.isArray(previousAccounts)) {
        const next = previousAccounts.map((acc) =>
          Number(acc.id) === id
            ? {
                ...acc,
                paymentcategory_sum_payment_amount:
                  Number(acc.paymentcategory_sum_payment_amount) + amt,
              }
            : acc
        );
        queryClient.setQueryData(PAYMENT_ACCOUNTS_KEY, next);
      }

      return { previousAccounts };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          PAYMENT_ACCOUNTS_KEY,
          context.previousAccounts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNTS_KEY });
    },
  });

  return {
    ...getPaymentAccounts, // data, isLoading, isFetching, error, refetch, etc.
    transferFunds, // { mutate, mutateAsync, isLoading, ... }
    addBalance, // { mutate, mutateAsync, isLoading, ... }
  };
}
