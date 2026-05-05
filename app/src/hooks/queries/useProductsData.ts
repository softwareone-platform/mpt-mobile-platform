import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useProductApi } from '@/services/productService';
import type { ListItemFull } from '@/types/api';

export const useProductsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
  query?: string,
) => {
  const { getProducts } = useProductApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['products', userId, currentAccountId, query],
    queryFn: (offset, limit) => getProducts(offset, limit, query),
    enabled: !!userId && !!currentAccountId,
  });
};
