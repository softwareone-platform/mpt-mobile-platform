import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useOrdersData } from '@/hooks/queries/useOrdersData';
import type { ListItemNoImageNoSubtitle } from '@/types/api';

interface OrdersContextValue {
  orders: ListItemNoImageNoSubtitle[];
  ordersLoading: boolean;
  ordersFetchingNext: boolean;
  hasMoreOrders: boolean;
  ordersError: boolean;
  isUnauthorised: boolean;
  fetchOrders: () => void;
  refetchOrders: () => void;
  isOrdersRefetching: boolean;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
  query?: string;
}

export const OrdersProvider = ({ children, query }: OrderProviderProps) => {
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
    refetch,
    isRefetching,
  } = useOrdersData(userId, currentAccountId, query);

  const orders = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        ordersLoading: isLoading,
        ordersFetchingNext: isFetchingNextPage,
        hasMoreOrders: !!hasNextPage,
        ordersError: isError,
        isUnauthorised,
        fetchOrders: fetchNextPage,
        refetchOrders: refetch,
        isOrdersRefetching: isRefetching,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used inside OrdersProvider');
  }
  return context;
};
