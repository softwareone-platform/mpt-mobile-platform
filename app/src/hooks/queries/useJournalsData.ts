import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImage } from '@/types/api';

export const useJournalsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getJournals } = useBillingApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['journals', userId, currentAccountId],
    queryFn: getJournals,
    enabled: !!userId && !!currentAccountId,
  });
};
