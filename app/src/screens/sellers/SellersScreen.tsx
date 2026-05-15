import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { SellersProvider, useSellers } from '@/context/SellersContext';
import { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SellersScreenRouteProp = RouteProp<RootStackParamList, 'sellers'>;

const SellersScreenContent = ({ contentContainerStyle }: ListProps) => {
  const {
    sellers,
    sellersLoading,
    sellersError,
    sellersFetchingNext,
    hasMoreSellers,
    isUnauthorised,
    fetchSellers,
    refetchSellers,
    isSellersRefetching,
  } = useSellers();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={sellersLoading}
      isError={!!sellersError}
      isEmpty={sellers.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SELLERS_LOADING_INDICATOR}
      errorTestId={TestIDs.SELLERS_ERROR_STATE}
      emptyTestId={TestIDs.SELLERS_EMPTY_STATE}
      emptyTitle={t('sellersScreen.emptyStateTitle')}
      emptyDescription={t('sellersScreen.emptyStateDescription')}
    >
      <ListView
        data={sellers}
        isFetchingNext={sellersFetchingNext}
        hasMore={hasMoreSellers}
        fetchNext={fetchSellers}
        config={listItemConfigFull}
        onRefresh={refetchSellers}
        isRefreshing={isSellersRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('sellerDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

export const SellersList = ({ query, source, contentContainerStyle }: ListProps) => {
  return (
    <SellersProvider query={query} source={source}>
      <SellersScreenContent contentContainerStyle={contentContainerStyle} />
    </SellersProvider>
  );
};

const SellersScreen = () => {
  const route = useRoute<SellersScreenRouteProp>();

  return <SellersList query={route.params?.query} source={route.params?.source} />;
};

export default SellersScreen;
