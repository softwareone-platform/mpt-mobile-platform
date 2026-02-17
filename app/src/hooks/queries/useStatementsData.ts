import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

export const useStatementsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getStatements } = useBillingApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['statements', userId, currentAccountId],
    queryFn: getStatements,
    enabled: !!userId && !!currentAccountId,
  });
};
