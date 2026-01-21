import { useQuery } from '@tanstack/react-query';

import { useBillingApi } from '@/services/billingService';
import type { CreditMemoDetails } from '@/types/billing';
import { isUnauthorisedError } from '@/utils/apiError';

export const useCreditMemoDetailsData = (
  creditMemoId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getCreditMemoDetails } = useBillingApi();

  const query = useQuery<CreditMemoDetails, Error>({
    queryKey: ['creditMemoDetails', creditMemoId, userId, currentAccountId],
    queryFn: () => {
      if (!creditMemoId) {
        throw new Error('Credit memo ID is required');
      }
      return getCreditMemoDetails(creditMemoId);
    },
    enabled: !!creditMemoId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
