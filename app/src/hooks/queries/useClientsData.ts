import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAccountApi } from '@/services/accountService';
import type { ListItemFull } from '@/types/api';

export const useClientsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getClients } = useAccountApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['clients', userId, currentAccountId],
    queryFn: (offset, limit) => getClients(userId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
