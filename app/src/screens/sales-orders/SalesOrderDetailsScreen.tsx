import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSalesOrderDetailsData } from '@/hooks/queries/useSalesOrderDetailsData';
import SalesOrderDetailsContent from '@/screens/sales-orders/SalesOrderDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SalesOrderDetailsRouteProp = RouteProp<RootStackParamList, 'salesOrderDetails'>;

const SalesOrderDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<SalesOrderDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised, refetch, isRefetching } =
    useSalesOrderDetailsData(id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SALES_ORDER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.SALES_ORDER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.SALES_ORDER_DETAILS_EMPTY_STATE}
      emptyTitle={t('salesOrderDetailsScreen.emptyStateTitle')}
      emptyDescription={t('salesOrderDetailsScreen.emptyStateDescription')}
      onRefresh={refetch}
      isRefreshing={isRefetching}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImageNoSubtitle}
          headerTitleTestId={TestIDs.SALES_ORDER_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.SALES_ORDER_DETAILS_HEADER_STATUS}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        >
          <SalesOrderDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default SalesOrderDetailsScreen;
