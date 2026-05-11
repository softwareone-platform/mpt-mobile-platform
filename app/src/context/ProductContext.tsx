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
  refetchProducts: () => void;
  isProductsRefetching: boolean;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
  query?: string;
}

export const ProductProvider = ({ children, query }: ProductProviderProps) => {
  const { userData, currentAccountId } = useAccount();

  const userId = userData?.id;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isUnauthorised,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useProductsData(userId, currentAccountId, query);

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
        refetchProducts: refetch,
        isProductsRefetching: isRefetching,
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
