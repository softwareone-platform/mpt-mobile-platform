import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { useAccount } from '@/context/AccountContext';
import { useOrderDetailsData } from '@/hooks/queries/useOrderDetailsData';
import OrderDetailsContent from '@/screens/orders/OrderDetailsContent';
import type { ListItemWithStatusProps } from '@/types/lists';
import type { TabParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type OrderDetailsRouteProp = RouteProp<TabParamList, 'orderDetails'>;

const OrderDetailsScreen = () => {
  const { t } = useTranslation();
  const { params } = useRoute<OrderDetailsRouteProp>();
  const headerData: ListItemWithStatusProps = params.headerProps;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: orderDetails,
    isLoading,
    isError,
    isUnauthorised,
  } = useOrderDetailsData(headerData.id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!orderDetails || Object.keys(orderDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CREDIT_MEMO_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.CREDIT_MEMO_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.CREDIT_MEMO_DETAILS_EMPTY_STATE}
      emptyTitle={t('orderDetailsScreen.emptyStateTitle')}
      emptyDescription={t('orderDetailsScreen.emptyStateDescription')}
    >
      <DetailsView header={headerData}>
        {orderDetails && <OrderDetailsContent data={orderDetails} />}
      </DetailsView>
    </StatusMessage>
  );
};

export default OrderDetailsScreen;
