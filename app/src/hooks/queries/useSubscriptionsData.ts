import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSubscriptionApi } from '@/services/subscriptionService';
import type { Subscription } from '@/types/subscription';

export const useSubscriptionsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSubscriptions } = useSubscriptionApi();

  return usePaginatedQuery<Subscription>({
    queryKey: ['subscriptions', userId, currentAccountId],
    queryFn: getSubscriptions,
    enabled: !!userId && !!currentAccountId,
  });
};
