import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useUserApi } from '@/services/userService';
import type { ListItemFull } from '@/types/api';

export const useOpsUsersData = (
  userId: string | undefined,
  shouldFetch: boolean = true,
  query?: string,
) => {
  const { getAllUsers } = useUserApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['allUsers', userId, query],
    queryFn: (offset, limit) => getAllUsers(offset, limit, query),
    enabled: !!userId && shouldFetch,
  });
};
