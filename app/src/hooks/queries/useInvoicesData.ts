import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { Invoice } from '@/types/billing';

export const useInvoicesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getInvoices } = useBillingApi();

  return usePaginatedQuery<Invoice>({
    queryKey: ['invoices', userId, currentAccountId],
    queryFn: getInvoices,
    enabled: !!userId && !!currentAccountId,
  });
};
