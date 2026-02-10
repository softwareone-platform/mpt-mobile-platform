import { useQuery } from '@tanstack/react-query';

import { useUserApi } from '@/services/userService';
import { User } from '@/types/api';
import { isUnauthorisedError } from '@/utils/apiError';

export const useUserDetailsData = (
  userId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getUserData } = useUserApi();

  const query = useQuery<User, Error>({
    queryKey: ['userDetails', userId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return getUserData(userId);
    },
    enabled: !!userId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
