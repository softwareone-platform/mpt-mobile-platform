import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { SellersProvider, useSellers } from '@/context/SellersContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const SellersScreenContent = () => {
  const {
    items,
    isLoading,
    isError,
    isFetchingNext,
    hasMore,
    isUnauthorised,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useSellers();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={items.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SELLERS_LOADING_INDICATOR}
      errorTestId={TestIDs.SELLERS_ERROR_STATE}
      emptyTestId={TestIDs.SELLERS_EMPTY_STATE}
      emptyTitle={t('sellersScreen.emptyStateTitle')}
      emptyDescription={t('sellersScreen.emptyStateDescription')}
    >
      <ListView
        data={items}
        isFetchingNext={isFetchingNext}
        hasMore={hasMore}
        fetchNext={fetchNextPage}
        config={listItemConfigFull}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        onItemPress={(id) => {
          navigation.navigate('accountDetails', {
            id,
            type: 'seller',
          });
        }}
      />
    </StatusMessage>
  );
};

const SellersScreen = () => (
  <SellersProvider>
    <SellersScreenContent />
  </SellersProvider>
);

export default SellersScreen;
