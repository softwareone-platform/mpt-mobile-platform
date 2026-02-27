import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { useSubscriptions, SubscriptionsProvider } from '@/context/SubscriptionsContext';
import type { RootStackParamList, SubscriptionsStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SubscriptionsScreenRouteProp = RouteProp<SubscriptionsStackParamList, 'subscriptionsRoot'>;

const SubscriptionsScreenContent = () => {
  const {
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    subscriptionsFetchingNext,
    hasMoreSubscriptions,
    isUnauthorised,
    fetchSubscriptions,
  } = useSubscriptions();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={subscriptionsLoading}
      isError={!!subscriptionsError}
      isEmpty={subscriptions.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SUBSCRIPTIONS_LOADING_INDICATOR}
      errorTestId={TestIDs.SUBSCRIPTIONS_ERROR_STATE}
      emptyTestId={TestIDs.SUBSCRIPTIONS_EMPTY_STATE}
      emptyTitle={t('subscriptionsScreen.emptyStateTitle')}
      emptyDescription={t('subscriptionsScreen.emptyStateDescription')}
    >
      <ListView
        data={subscriptions}
        isFetchingNext={subscriptionsFetchingNext}
        hasMore={hasMoreSubscriptions}
        fetchNext={fetchSubscriptions}
        config={listItemConfigNoImage}
        onItemPress={(id) => {
          navigation.navigate('subscriptionDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const SubscriptionsScreen = () => {
  const route = useRoute<SubscriptionsScreenRouteProp>();
  const query = route.params?.query;

  return (
    <SubscriptionsProvider query={query}>
      <SubscriptionsScreenContent />
    </SubscriptionsProvider>
  );
};

export default SubscriptionsScreen;
