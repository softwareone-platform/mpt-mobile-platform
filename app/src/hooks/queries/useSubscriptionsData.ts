import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { ListItemNoImage } from '@/types/api';

export const useSubscriptionsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSubscriptions } = useSubscriptionApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['subscriptions', userId, currentAccountId],
    queryFn: getSubscriptions,
    enabled: !!userId && !!currentAccountId,
  });
};
