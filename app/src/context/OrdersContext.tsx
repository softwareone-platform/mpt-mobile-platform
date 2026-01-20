import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useAccount } from '@/context/AccountContext';
import { useOrdersData } from '@/hooks/queries/useOrdersData';
import type { Order } from '@/types/order';

interface OrdersContextValue {
  orders: Order[];
  ordersLoading: boolean;
  ordersFetchingNext: boolean;
  hasMoreOrders: boolean;
  ordersError: boolean;
  isUnauthorised: boolean;
  fetchOrders: () => void;
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
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
  } = useOrdersData(userId, currentAccountId);

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
