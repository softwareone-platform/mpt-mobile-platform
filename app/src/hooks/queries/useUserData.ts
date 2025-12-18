import { useQuery } from '@tanstack/react-query';
import { useAccountApi } from '@/services/accountService';

export const useUserData = (userId: string | undefined) => {
  const { getUserData } = useAccountApi();

  return useQuery({
    queryKey: ['userData', userId],
    queryFn: () => getUserData(userId!),
    enabled: !!userId,
  });
};
