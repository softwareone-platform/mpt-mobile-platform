import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { OrdersProvider, useOrders } from '../context';
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
        onItemPress={(item) => console.info(item.id)}
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
