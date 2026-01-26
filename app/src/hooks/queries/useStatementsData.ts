import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { Statement } from '@/types/billing';

export const useStatementsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getStatements } = useBillingApi();

  return usePaginatedQuery<Statement>({
    queryKey: ['statements', userId, currentAccountId],
    queryFn: getStatements,
    enabled: !!userId && !!currentAccountId,
  });
};
