import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAccountApi } from '@/services/accountService';
import type { ListItemFull } from '@/types/api';

export const useVendorsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getVendors } = useAccountApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['vendors', userId, currentAccountId],
    queryFn: (offset, limit) => getVendors(userId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
