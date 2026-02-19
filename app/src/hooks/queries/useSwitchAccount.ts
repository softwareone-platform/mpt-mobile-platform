import { useMutation } from '@tanstack/react-query';

import { useAccountApi } from '@/services/accountService';

export const useSwitchAccount = (userId: string | undefined) => {
  const { switchAccount: apiSwitchAccount } = useAccountApi();

  return useMutation({
    mutationFn: (accountId: string) => apiSwitchAccount(userId!, accountId),
  });
};
