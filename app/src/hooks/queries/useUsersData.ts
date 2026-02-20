import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useUserApi } from '@/services/userService';
import type { ListItemFull } from '@/types/api';

export const useUsersData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  shouldFetch: boolean = true,
) => {
  const { getUsers } = useUserApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['users', userId, currentAccountId],
    queryFn: (offset, limit) => getUsers(currentAccountId!, offset, limit),
    enabled: !!userId && !!currentAccountId && shouldFetch,
  });
};
