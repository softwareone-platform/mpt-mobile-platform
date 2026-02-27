import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useBuyers, BuyersProvider } from '@/context/BuyersContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type BuyersScreenRouteProp = RouteProp<RootStackParamList, 'buyers'>;

const BuyersScreenContent = () => {
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type;

  const {
    buyers,
    isBuyersLoading,
    isBuyersError,
    isBuyersFetchingNext,
    hasMoreBuyers,
    isUnauthorised,
    fetchBuyersNextPage,
  } = useBuyers();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  if (accountType === 'Vendor') {
    return (
      <StatusMessage
        isLoading={false}
        isError={false}
        isEmpty={true}
        isUnauthorised={false}
        emptyTestId={TestIDs.BUYERS_EMPTY_STATE}
        emptyTitle={t('buyersScreen.emptyStateTitle')}
        emptyDescription={t('buyersScreen.emptyStateDescription')}
      >
        {null}
      </StatusMessage>
    );
  }

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
        fetchNext={fetchBuyersNextPage}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('buyerDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const BuyersScreen = () => {
  const route = useRoute<BuyersScreenRouteProp>();

  const query = route.params?.query;

  return (
    <BuyersProvider query={query}>
      <BuyersScreenContent />
    </BuyersProvider>
  );
};

export default BuyersScreen;
