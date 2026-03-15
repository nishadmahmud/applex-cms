// hooks/usePurchaseInvoices.js
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function usePurchaseInvoices(
  page = 1,
  limit = 10,
  { enabled = true } = {}
) {
  const query = useQuery({
    queryKey: ["purchase-invoices", page, limit],
    queryFn: async () => {
      const res = await api.get(
        `/purchase-invoice-list?page=${page}&limit=${limit}`
      );
      return res.data; // API envelope: { status, success, message, data: { current_page, data: [...] } }
    },
    enabled,
  });

  return {
    purchaseInvoiceEnvelope: query.data,
    // invoice array lives under envelope.data.data based on your example
    purchaseInvoiceItems: query.data?.data ?? [],
    purchaseInvoiceMeta: query.data?.meta ?? null,
    isPurchaseInvoiceLoading: query.isLoading,
    isPurchaseInvoiceError: query.isError,
    PurchaseInvoiceError: query.error,
    PurchaseInvoiceRefetch: query.refetch,
  };
}
