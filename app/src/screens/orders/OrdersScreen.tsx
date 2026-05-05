import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useOrders, OrdersProvider } from '@/context/OrdersContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type OrdersScreenRouteProp = RouteProp<RootStackParamList, 'orders'>;

const OrdersListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    orders,
    ordersLoading,
    ordersError,
    ordersFetchingNext,
    hasMoreOrders,
    isUnauthorised,
    fetchOrders,
    refetchOrders,
    isOrdersRefetching,
  } = useOrders();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={ordersLoading}
      isError={!!ordersError}
      isEmpty={orders.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.ORDERS_LOADING_INDICATOR}
      errorTestId={TestIDs.ORDERS_ERROR_STATE}
      emptyTestId={TestIDs.ORDERS_EMPTY_STATE}
      emptyTitle={t('ordersScreen.emptyStateTitle')}
      emptyDescription={t('ordersScreen.emptyStateDescription')}
    >
      <ListView
        data={orders}
        isFetchingNext={ordersFetchingNext}
        hasMore={hasMoreOrders}
        fetchNext={fetchOrders}
        config={listItemConfigNoImageNoSubtitle}
        onRefresh={refetchOrders}
        isRefreshing={isOrdersRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('orderDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

export const OrdersList = ({ query, contentContainerStyle }: ListProps) => (
  <OrdersProvider query={query}>
    <OrdersListContent contentContainerStyle={contentContainerStyle} />
  </OrdersProvider>
);

const OrdersScreen = () => {
  const route = useRoute<OrdersScreenRouteProp>();
  return <OrdersList query={route.params?.query} />;
};

export default OrdersScreen;
