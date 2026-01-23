import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useUserApi } from '@/services/userService';
import type { Licensee } from '@/types/api';

export const useLicenseesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getLicensees } = useUserApi();

  return usePaginatedQuery<Licensee>({
    queryKey: ['licensees', userId, currentAccountId],
    queryFn: (offset, limit) => getLicensees(currentAccountId!, offset, limit),
    enabled: !!userId && !!currentAccountId,
  });
};
