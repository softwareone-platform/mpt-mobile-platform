import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAccountApi } from '@/services/accountService';
import type { ListItemFull } from '@/types/api';

export const useSellersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSellers } = useAccountApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['sellers', userId, currentAccountId],
    queryFn: (offset, limit) => getSellers(offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
