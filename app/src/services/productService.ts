import { useCallback, useMemo } from 'react';

import { useApi } from '@/hooks/useApi';
import type { ProductData } from '@/types/admin';

export function useProductApi() {
  const api = useApi();

  const getProductData = useCallback(
    async (productId: string): Promise<ProductData> => {
      const endpoint = `/v1/catalog/products/${productId}`;
      return api.get<ProductData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getProductData,
    }),
    [getProductData],
  );
}
