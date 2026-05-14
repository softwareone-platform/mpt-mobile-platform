import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageWithExternalIds } from '@/config/list';
import { useSalesOrders, SalesOrdersProvider } from '@/context/SalesOrdersContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SalesOrdersScreenRouteProp = RouteProp<RootStackParamList, 'salesOrders'>;

const SalesOrdersListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    salesOrders,
    salesOrdersLoading,
    salesOrdersError,
    salesOrdersFetchingNext,
    hasMoreSalesOrders,
    isUnauthorised,
    fetchSalesOrders,
    refetchSalesOrders,
    isSalesOrdersRefetching,
  } = useSalesOrders();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={salesOrdersLoading}
      isError={!!salesOrdersError}
      isEmpty={salesOrders.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SALES_ORDERS_LOADING_INDICATOR}
      errorTestId={TestIDs.SALES_ORDERS_ERROR_STATE}
      emptyTestId={TestIDs.SALES_ORDERS_EMPTY_STATE}
      emptyTitle={t('salesOrdersScreen.emptyStateTitle')}
      emptyDescription={t('salesOrdersScreen.emptyStateDescription')}
      onRefresh={refetchSalesOrders}
      isRefreshing={isSalesOrdersRefetching}
    >
      <ListView
        data={salesOrders}
        isFetchingNext={salesOrdersFetchingNext}
        hasMore={hasMoreSalesOrders}
        fetchNext={fetchSalesOrders}
        config={listItemConfigNoImageWithExternalIds}
        onRefresh={refetchSalesOrders}
        isRefreshing={isSalesOrdersRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('salesOrderDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

export const SalesOrdersList = ({ query, contentContainerStyle }: ListProps) => (
  <SalesOrdersProvider query={query}>
    <SalesOrdersListContent contentContainerStyle={contentContainerStyle} />
  </SalesOrdersProvider>
);

const SalesOrdersScreen = () => {
  const route = useRoute<SalesOrdersScreenRouteProp>();
  return <SalesOrdersList query={route.params?.query} />;
};

export default SalesOrdersScreen;
