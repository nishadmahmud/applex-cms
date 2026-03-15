import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function usePurchaseReturnDetails(invoiceId) {
  // Optional: debounce, in case invoiceId comes from user input
  const [debouncedInvoiceId, setDebouncedInvoiceId] = useState(invoiceId);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInvoiceId(invoiceId);
    }, 600);

    return () => clearTimeout(handler);
  }, [invoiceId]);

  const purchaseReturnDetails = useQuery({
    queryKey: ['saleReturnDetails', debouncedInvoiceId],
    queryFn: async () => {
      const res = await api.get(
        `/return-invoice-details/${debouncedInvoiceId}`
      );
      return res.data;
    },
    enabled: !!debouncedInvoiceId, // only run when an ID exists
  });

  return {
    purchaseReturnDetails,
  };
}