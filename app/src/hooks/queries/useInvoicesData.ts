import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

export const useInvoicesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getInvoices } = useBillingApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['invoices', userId, currentAccountId],
    queryFn: getInvoices,
    enabled: !!userId && !!currentAccountId,
  });
};
