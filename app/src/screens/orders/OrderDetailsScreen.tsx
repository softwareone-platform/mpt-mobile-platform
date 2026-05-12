import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useOrderDetailsData } from '@/hooks/queries/useOrderDetailsData';
import OrderDetailsContent from '@/screens/orders/OrderDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'orderDetails'>;

const OrderDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<OrderDetailsRouteProp>().params;

  const { userData, currentAccountId } = useAccount();
  const userId = userData?.id;

  const { data, isLoading, isError, isUnauthorised, refetch, isRefetching } = useOrderDetailsData(
    id,
    userId,
    currentAccountId,
  );

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.ORDER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.ORDER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.ORDER_DETAILS_EMPTY_STATE}
      emptyTitle={t('orderDetailsScreen.emptyStateTitle')}
      emptyDescription={t('orderDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImageNoSubtitle}
          headerTitleTestId={TestIDs.ORDER_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.ORDER_DETAILS_HEADER_STATUS}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        >
          <OrderDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default OrderDetailsScreen;
