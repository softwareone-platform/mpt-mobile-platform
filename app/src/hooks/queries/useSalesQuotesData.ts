import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useSalesQuoteApi } from '@/services/salesQuoteService';
import type { ListItemNoImageWithExternalIds } from '@/types/api';

export const useSalesQuotesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getSalesQuotes } = useSalesQuoteApi();

  return usePaginatedQuery<ListItemNoImageWithExternalIds>({
    queryKey: ['salesQuotes', userId, currentAccountId, query],
    queryFn: (offset, limit) => getSalesQuotes(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
