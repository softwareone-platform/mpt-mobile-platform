import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { VendorsProvider, useVendors } from '@/context/VendorsContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const VendorsScreenContent = () => {
  const {
    vendors,
    isVendorsLoading,
    isVendorsError,
    isVendorsFetchingNext,
    hasMoreVendors,
    isUnauthorised,
    fetchVendorsNextPage,
  } = useVendors();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isVendorsLoading}
      isError={!!isVendorsError}
      isEmpty={vendors.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.VENDORS_LOADING_INDICATOR}
      errorTestId={TestIDs.VENDORS_ERROR_STATE}
      emptyTestId={TestIDs.VENDORS_EMPTY_STATE}
      emptyTitle={t('vendorsScreen.emptyStateTitle')}
      emptyDescription={t('vendorsScreen.emptyStateDescription')}
    >
      <ListView
        data={vendors}
        isFetchingNext={isVendorsFetchingNext}
        hasMore={hasMoreVendors}
        fetchNext={fetchVendorsNextPage}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('accountDetails', {
            id,
            type: 'vendor',
          });
        }}
      />
    </StatusMessage>
  );
};

const VendorsScreen = () => (
  <VendorsProvider>
    <VendorsScreenContent />
  </VendorsProvider>
);

export default VendorsScreen;
