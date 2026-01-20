import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { useUserApi } from '../services';
import type { User } from '@/shared/types/api';

export const useUsersData = (userId: string | undefined, currentAccountId: string | undefined) => {
  const { getUsers } = useUserApi();

  return usePaginatedQuery<User>({
    queryKey: ['users', userId, currentAccountId],
    queryFn: (offset, limit) => getUsers(currentAccountId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
