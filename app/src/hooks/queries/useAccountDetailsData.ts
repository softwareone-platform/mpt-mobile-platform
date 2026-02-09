import { useQuery } from '@tanstack/react-query';

import { useAccountApi } from '@/services/accountService';
import { AccountDetails } from '@/types/api';
import { isUnauthorisedError } from '@/utils/apiError';

export const useAccountDetailsData = (
  accountId: string | undefined,
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getAccountData } = useAccountApi();

  const query = useQuery<AccountDetails, Error>({
    queryKey: ['accountDetails', accountId, userId, currentAccountId],
    queryFn: () => {
      if (!accountId) {
        throw new Error('Account ID is required');
      }
      return getAccountData(accountId);
    },
    enabled: !!accountId && !!userId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
