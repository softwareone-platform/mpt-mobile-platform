import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useBillingApi } from '@/services/billingService';
import type { CreditMemo } from '@/types/billing';

export const useCreditMemosData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getCreditMemos } = useBillingApi();

  return usePaginatedQuery<CreditMemo>({
    queryKey: ['creditMemos', userId, currentAccountId],
    queryFn: getCreditMemos,
    enabled: !!userId && !!currentAccountId,
  });
};
