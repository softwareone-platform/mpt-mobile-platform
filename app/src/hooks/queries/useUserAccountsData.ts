import { useQuery } from '@tanstack/react-query';
import { useAccountApi } from '@/services/accountService';

export const useUserAccountsData = (userId: string | undefined) => {
  const { getUserAccountsData } = useAccountApi();

  return useQuery({
    queryKey: ['userAccountsData', userId],
    queryFn: async () => {
      const { data } = await getUserAccountsData(userId!);
      return data;
    },
    enabled: !!userId,
  });
};
