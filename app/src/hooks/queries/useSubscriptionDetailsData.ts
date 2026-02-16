import { useQuery } from '@tanstack/react-query';

import { useSubscriptionApi } from '@/services/subscriptionService';
import { SubscriptionData } from '@/types/subscription';
import { isUnauthorisedError } from '@/utils/apiError';

export const useSubscriptionDetailsData = (
  subscriptionId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSubscriptionData } = useSubscriptionApi();

  const query = useQuery<SubscriptionData, Error>({
    queryKey: ['subscriptionDetails', subscriptionId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }
      return getSubscriptionData(subscriptionId);
    },
    enabled: !!subscriptionId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
