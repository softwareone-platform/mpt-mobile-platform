import { useQuery } from '@tanstack/react-query';
import { useAccountApi } from '@/services/accountService';
import { formatUserAccountsData } from '@/utils/account';
import { FormattedUserAccounts } from '@/types/api';
import { MAX_RECENT_ACCOUNTS } from '@/constants/api';

export const useUserAccountsData = (userId: string | undefined) => {
  const { getUserAccountsData } = useAccountApi();

  return useQuery<FormattedUserAccounts>({
    queryKey: ['userAccountsData', userId],
    queryFn: async () => {
      const { data } = await getUserAccountsData(userId!);

      const formattedData = formatUserAccountsData(data, MAX_RECENT_ACCOUNTS);

      return formattedData;
    },
    enabled: !!userId,
  });
};
