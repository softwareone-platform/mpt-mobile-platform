import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAgreementApi } from '@/services/agreementService';
import type { ListItemNoImage } from '@/types/api';

export const useAgreementsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getAgreements } = useAgreementApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['agreements', userId, currentAccountId, query],
    queryFn: (offset, limit) => getAgreements(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
