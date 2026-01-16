import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useUserApi } from '@/services/userService';
import type { User } from '@/types/api';

export const useUsersData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getUsers } = useUserApi();

  return usePaginatedQuery<User>({
    queryKey: ['users', userId, currentAccountId],
    queryFn: (offset, limit) => getUsers(currentAccountId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
