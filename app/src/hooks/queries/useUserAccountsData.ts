import { useQuery } from '@tanstack/react-query';

import { MAX_RECENT_ACCOUNTS } from '@/constants/api';
import { useAccountApi } from '@/services/accountService';
import { FormattedUserAccounts } from '@/types/api';
import { formatUserAccountsData } from '@/utils/account';

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
