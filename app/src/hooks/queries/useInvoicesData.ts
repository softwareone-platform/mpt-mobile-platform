import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

export const useInvoicesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getInvoices } = useBillingApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['invoices', userId, currentAccountId, query],
    queryFn: (offset, limit) => getInvoices(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
