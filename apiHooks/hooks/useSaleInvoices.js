import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useSaleInvoices(page = 1, limit = 10, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: ["sale-invoices", page, limit],
    queryFn: async () => {
      const res = await api.get(`/invoice-list?page=${page}&limit=${limit}`);
      return res.data; // API envelope
    },
    enabled,
  });

  return {
    saleInvoiceEnvelope: query.data,
    saleInvoiceItems: query.data?.data ?? [], // envelope.data.data -> array
    saleInvoiceMeta: query.data?.meta ?? query.data?.data?.meta ?? null, // if your API has meta
    isSaleInvoiceLoading: query.isLoading,
    isSaleInvoiceError: query.isError,
    SaleInvoiceError: query.error,
    SaleInvoiceRefetch: query.refetch,
  };
}
