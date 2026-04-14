import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useLicenseeApi } from '@/services/licenseeService';
import type { ListItemFull } from '@/types/api';

export const useLicenseesData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getLicensees } = useLicenseeApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['licensees', userId, currentAccountId, query],
    queryFn: (offset, limit) => getLicensees(currentAccountId!, offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
