import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAccountApi } from '@/services/accountService';
import type { UserAccount } from '@/types/api';

export const useUserAccountsData = (userId: string | undefined) => {
  const { getUserAccountsData } = useAccountApi();

  return usePaginatedQuery<UserAccount>({
    queryKey: ['userAccountsData', userId],
    queryFn: (offset, limit) => {
      if (!userId) {
        throw new Error('userId is required for fetching accounts');
      }
      return getUserAccountsData(userId, offset, limit);
    },
    enabled: !!userId,
  });
};
