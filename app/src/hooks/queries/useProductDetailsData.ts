import { useQuery } from '@tanstack/react-query';

import { useProductApi } from '@/services/productService';
import { ProductData } from '@/types/admin';
import { isUnauthorisedError } from '@/utils/apiError';

export const useProductDetailsData = (
  productId: string | undefined,
  currentUserId: string | undefined,
  currentAccountId: string | undefined,
) => {
  const { getProductData } = useProductApi();

  const query = useQuery<ProductData, Error>({
    queryKey: ['productDetails', productId, currentUserId, currentAccountId],
    queryFn: () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return getProductData(productId);
    },
    enabled: !!productId && !!currentUserId && !!currentAccountId,
  });

  return {
    ...query,
    isUnauthorised: isUnauthorisedError(query.error),
  };
};
