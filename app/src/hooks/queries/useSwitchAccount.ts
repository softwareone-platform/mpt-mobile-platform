import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAccountApi } from '@/services/accountService';

export const useSwitchAccount = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { switchAccount: apiSwitchAccount } = useAccountApi();

  return useMutation({
    mutationFn: (accountId: string) => apiSwitchAccount(userId!, accountId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['userData', userId] });
      void queryClient.invalidateQueries({ queryKey: ['userAccountsData', userId] });
    },
  });
};
