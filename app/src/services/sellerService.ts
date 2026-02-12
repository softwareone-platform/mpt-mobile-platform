import { useCallback, useMemo } from 'react';

import { useApi } from '@/hooks/useApi';
import type { SellerData } from '@/types/admin';

export function useSellerApi() {
  const api = useApi();

  const getSellerData = useCallback(
    async (sellerId: string): Promise<SellerData> => {
      const endpoint = `/v1/accounts/sellers/${sellerId}?select=audit.created.at,audit.created.by,audit.updated.at,audit.updated.by`;
      return api.get<SellerData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getSellerData,
    }),
    [getSellerData],
  );
}
