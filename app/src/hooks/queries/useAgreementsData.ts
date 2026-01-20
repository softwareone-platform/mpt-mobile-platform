import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useAgreementApi } from '@/services/agreementService';
import type { Agreement } from '@/types/agreement';

export const useAgreementsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getAgreements } = useAgreementApi();

  return usePaginatedQuery<Agreement>({
    queryKey: ['agreements', userId, currentAccountId],
    queryFn: getAgreements,
    enabled: !!userId && !!currentAccountId,
  });
};
