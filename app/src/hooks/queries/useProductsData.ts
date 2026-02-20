import { usePaginatedQuery } from '@/hooks/queries/usePaginatedQuery';
import { useProductApi } from '@/services/productService';
import type { ListItemFull } from '@/types/api';

export const useProductsData = (
  userId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getProducts } = useProductApi();

  return usePaginatedQuery<ListItemFull>({
    queryKey: ['products', userId, currentAccountId],
    queryFn: getProducts,
    enabled: !!userId && !!currentAccountId,
  });
};
