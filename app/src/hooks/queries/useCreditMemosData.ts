import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

export const useCreditMemosData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getCreditMemos } = useBillingApi();

  return usePaginatedQuery<ListItemNoImageNoSubtitle>({
    queryKey: ['creditMemos', userId, currentAccountId],
    queryFn: getCreditMemos,
    enabled: !!userId && !!currentAccountId,
  });
};
