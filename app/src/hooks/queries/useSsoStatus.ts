import { useQuery } from '@tanstack/react-query';

import { useUserApi } from '@/services/userService';
import { SsoStatus } from '@/types/api';
import { isUnauthorisedError } from '@/utils/apiError';

export const useSsoSttatus = (
  userId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getSsoStatus } = useUserApi();

  const query = useQuery<SsoStatus, Error>({
    queryKey: ['ssoStatus', userId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getSsoStatus(userId);
    },
    enabled: !!userId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
