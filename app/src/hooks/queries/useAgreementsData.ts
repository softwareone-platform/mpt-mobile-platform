import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAgreementApi } from '@/services/agreementService';
import type { ListItemNoImage } from '@/types/api';

export const useAgreementsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getAgreements } = useAgreementApi();

  return usePaginatedQuery<ListItemNoImage>({
    queryKey: ['agreements', userId, currentAccountId],
    queryFn: getAgreements,
    enabled: !!userId && !!currentAccountId,
  });
};
