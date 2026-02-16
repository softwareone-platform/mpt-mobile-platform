import { useQuery } from '@tanstack/react-query';

import { useBillingApi } from '@/services/billingService';
import type { InvoiceDetails } from '@/types/billing';
import { isUnauthorisedError } from '@/utils/apiError';

export const useInvoiceDetailsData = (
  invoiceId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getInvoiceDetails } = useBillingApi();

  const query = useQuery<InvoiceDetails, Error>({
    queryKey: ['invoiceDetails', invoiceId, userId, currentAccountId],
    queryFn: () => {
      if (!invoiceId) {
        throw new Error('Invoice ID is required');
      }
      return getInvoiceDetails(invoiceId);
    },
    enabled: !!invoiceId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
