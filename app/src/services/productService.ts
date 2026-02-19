import { useCallback, useMemo } from 'react';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import type { ProductData } from '@/types/admin';
import type { PaginatedResponse, ListItemFull } from '@/types/api';

export function useProductApi() {
  const api = useApi();

  const getProducts = useCallback(
    async (
      offset: number = DEFAULT_OFFSET,
      limit: number = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<ListItemFull>> => {
      const endpoint =
        `/v1/catalog/products` +
        `?ne(status,%22Draft%22)` +
        `&order=name` +
        `&offset=${offset}` +
        `&limit=${limit}`;

      return api.get<PaginatedResponse<ListItemFull>>(endpoint);
    },
    [api],
  );

  const getProductData = useCallback(
    async (productId: string): Promise<ProductData> => {
      const endpoint = `/v1/catalog/products/${productId}`;
      return api.get<ProductData>(endpoint);
    },
    [api],
  );

  return useMemo(
    () => ({
      getProducts,
      getProductData,
    }),
    [getProducts, getProductData],
  );
}
