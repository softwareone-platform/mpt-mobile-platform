import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { useSubscriptions, SubscriptionsProvider } from '@/context/SubscriptionsContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SubscriptionsScreenRouteProp = RouteProp<RootStackParamList, 'subscriptions'>;

const SubscriptionsListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    subscriptionsFetchingNext,
    hasMoreSubscriptions,
    isUnauthorised,
    fetchSubscriptions,
    refetchSubscriptions,
    isSubscriptionsRefetching,
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
      onRefresh={refetchSubscriptions}
      isRefreshing={isSubscriptionsRefetching}
    >
      <ListView
        data={subscriptions}
        isFetchingNext={subscriptionsFetchingNext}
        hasMore={hasMoreSubscriptions}
        fetchNext={fetchSubscriptions}
        config={listItemConfigNoImage}
        onRefresh={refetchSubscriptions}
        isRefreshing={isSubscriptionsRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('subscriptionDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

export const SubscriptionsList = ({ query, source, contentContainerStyle }: ListProps) => {
  return (
    <SubscriptionsProvider query={query} source={source}>
      <SubscriptionsListContent contentContainerStyle={contentContainerStyle} />
    </SubscriptionsProvider>
  );
};

const SubscriptionsScreen = () => {
  const route = useRoute<SubscriptionsScreenRouteProp>();

  return <SubscriptionsList query={route.params?.query} source={route.params?.source} />;
};

export default SubscriptionsScreen;
