import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { ListItemNoImage } from '@/types/api';

export const useSubscriptionsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getSubscriptions } = useSubscriptionApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['subscriptions', userId, currentAccountId, query],
    queryFn: (offset, limit) => getSubscriptions(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
