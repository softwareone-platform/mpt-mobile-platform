import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useProductsData } from '@/hooks/queries/useProductsData';
import type { ListItemFull } from '@/types/api';

interface ProductContextValue {
  products: ListItemFull[];
  isProductsLoading: boolean;
  isProductsFetchingNext: boolean;
  hasMoreProducts: boolean;
  isProductsError: boolean;
  isUnauthorised: boolean;
  fetchProductsNextPage: () => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { userData } = useAccount();

  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
  } = useProductsData(userId, currentAccountId);

  const products = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <ProductContext.Provider
      value={{
        products,
        isProductsLoading: isLoading,
        isProductsFetchingNext: isFetchingNextPage,
        hasMoreProducts: !!hasNextPage,
        isProductsError: isError,
        isUnauthorised,
        fetchProductsNextPage: fetchNextPage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used inside ProductProvider');
  }
  return context;
};
