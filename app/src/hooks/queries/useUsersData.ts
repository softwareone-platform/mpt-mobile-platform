import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useUserApi } from '@/services/userService';
import type { ListItemFull } from '@/types/api';

export const useUsersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  shouldFetch: boolean = true,
  query?: string,
) => {
  const { getUsers } = useUserApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['users', userId, currentAccountId, query],
    queryFn: (offset, limit) => getUsers(currentAccountId!, offset, limit, query),
    enabled: !!userId && !!currentAccountId && shouldFetch,
  });
};
