import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { useBillingApi } from '../services';
import type { CreditMemo } from '../types';

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
