import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { SubscriptionsProvider, useSubscriptions } from '../context';
import { TestIDs } from '@/utils/testID';

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
        onItemPress={(item) => console.info(item.id)}
      />
    </StatusMessage>
  );
};

const SubscriptionsScreen = () => (
  <SubscriptionsProvider>
    <SubscriptionsScreenContent />
  </SubscriptionsProvider>
);

export default SubscriptionsScreen;
