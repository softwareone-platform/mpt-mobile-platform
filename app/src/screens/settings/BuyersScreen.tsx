import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useBuyers, BuyersProvider } from '@/context/BuyersContext';
import { TestIDs } from '@/utils/testID';

const BuyersScreenContent = () => {
  const {
    buyers,
    isBuyersLoading,
    isBuyersError,
    isBuyersFetchingNext,
    hasMoreBuyers,
    isUnauthorised,
    fetchBuyers,
  } = useBuyers();

  const { t } = useTranslation();

  return (
    <StatusMessage
      isLoading={isBuyersLoading}
      isError={!!isBuyersError}
      isEmpty={buyers.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.BUYERS_LOADING_INDICATOR}
      errorTestId={TestIDs.BUYERS_ERROR_STATE}
      emptyTestId={TestIDs.BUYERS_EMPTY_STATE}
      emptyTitle={t('buyersScreen.emptyStateTitle')}
      emptyDescription={t('buyersScreen.emptyStateDescription')}
    >
      <ListView
        data={buyers}
        isFetchingNext={isBuyersFetchingNext}
        hasMore={hasMoreBuyers}
        fetchNext={fetchBuyers}
        config={listItemConfigFull}
        onItemPress={(item) => console.info(item.id)}
      />
    </StatusMessage>
  );
};

const BuyersScreen = () => (
  <BuyersProvider>
    <BuyersScreenContent />
  </BuyersProvider>
);

export default BuyersScreen;
