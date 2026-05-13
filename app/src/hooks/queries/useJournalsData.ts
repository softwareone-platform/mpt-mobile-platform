import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImage } from '@/types/api';

export const useJournalsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getJournals } = useBillingApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['journals', userId, currentAccountId, query],
    queryFn: (offset, limit) => getJournals(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
