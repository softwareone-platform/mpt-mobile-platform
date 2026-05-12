import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImage } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSubscriptionDetailsData } from '@/hooks/queries/useSubscriptionDetailsData';
import SubscriptionDetailsContent from '@/screens/subscriptions/SubscriptionDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SubscriptionDetailsRouteProp = RouteProp<RootStackParamList, 'subscriptionDetails'>;

const SubscriptionDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<SubscriptionDetailsRouteProp>().params;

  const { userData, currentAccountId } = useAccount();
  const userId = userData?.id;

  const { data, isLoading, isError, isUnauthorised, refetch, isRefetching } =
    useSubscriptionDetailsData(id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SUBSCRIPTION_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.SUBSCRIPTION_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.SUBSCRIPTION_DETAILS_EMPTY_STATE}
      emptyTitle={t('subscriptionDetailsScreen.emptyStateTitle')}
      emptyDescription={t('subscriptionDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImage}
          headerTitleTestId={TestIDs.SUBSCRIPTION_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.SUBSCRIPTION_DETAILS_HEADER_STATUS}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        >
          <SubscriptionDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default SubscriptionDetailsScreen;
