import { useQuery } from '@tanstack/react-query';

import { useSalesQuoteApi } from '@/services/salesQuoteService';
import type { SalesQuoteDetails } from '@/types/procurement';
import { isUnauthorisedError } from '@/utils/apiError';

export const useSalesQuoteDetailsData = (
  salesQuoteId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSalesQuoteDetails } = useSalesQuoteApi();

  const query = useQuery<SalesQuoteDetails, Error>({
    queryKey: ['salesQuoteDetails', salesQuoteId, userId, currentAccountId],
    queryFn: () => {
      if (!salesQuoteId) {
        throw new Error('Quote ID is required');
      }
      return getSalesQuoteDetails(salesQuoteId);
    },
    enabled: !!salesQuoteId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
