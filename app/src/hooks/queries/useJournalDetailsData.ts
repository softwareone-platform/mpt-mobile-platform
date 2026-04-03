import { useQuery } from '@tanstack/react-query';

import { useBillingApi } from '@/services/billingService';
import type { JournalDetails } from '@/types/billing';
import { isUnauthorisedError } from '@/utils/apiError';

export const useJournalDetailsData = (
  journalId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getJournalDetails } = useBillingApi();

  const query = useQuery<JournalDetails, Error>({
    queryKey: ['journalDetails', journalId, userId, currentAccountId],
    queryFn: () => {
      if (!journalId) {
        throw new Error('Journal ID is required');
      }
      return getJournalDetails(journalId);
    },
    enabled: !!journalId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
