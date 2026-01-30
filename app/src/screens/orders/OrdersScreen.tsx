import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useOrders, OrdersProvider } from '@/context/OrdersContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const OrdersScreenContent = () => {
  const {
    orders,
    ordersLoading,
    ordersError,
    ordersFetchingNext,
    hasMoreOrders,
    isUnauthorised,
    fetchOrders,
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
        onItemPress={(mapped) => {
          navigation.navigate('orderDetails', {
            headerProps: mapped,
          });
        }}
      />
    </StatusMessage>
  );
};

const OrdersScreen = () => (
  <OrdersProvider>
    <OrdersScreenContent />
  </OrdersProvider>
);

export default OrdersScreen;
