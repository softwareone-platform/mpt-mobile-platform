import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useLicensees, LicenseeProvider } from '@/context/LicenseeContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type LicenseesScreenRouteProp = RouteProp<RootStackParamList, 'licensees'>;

const LicenseesScreenContent = () => {
  const {
    licensees,
    isLicenseesLoading,
    isLicenseesError,
    isLicenseesFetchingNext,
    hasMoreLicensees,
    isUnauthorised,
    fetchLicenseesNextPage,
    refetchLicensees,
    isLicenseesRefetching,
  } = useLicensees();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isLicenseesLoading}
      isError={!!isLicenseesError}
      isEmpty={licensees.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.LICENSEES_LOADING_INDICATOR}
      errorTestId={TestIDs.LICENSEES_ERROR_STATE}
      emptyTestId={TestIDs.LICENSEES_EMPTY_STATE}
      emptyTitle={t('licenseesScreen.emptyStateTitle')}
      emptyDescription={t('licenseesScreen.emptyStateDescription')}
      onRefresh={refetchLicensees}
      isRefreshing={isLicenseesRefetching}
    >
      <ListView
        data={licensees}
        isFetchingNext={isLicenseesFetchingNext}
        hasMore={hasMoreLicensees}
        fetchNext={fetchLicenseesNextPage}
        config={listItemConfigFull}
        onRefresh={refetchLicensees}
        isRefreshing={isLicenseesRefetching}
        onItemPress={(id) => {
          navigation.navigate('licenseeDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const LicenseesScreen = () => {
  const route = useRoute<LicenseesScreenRouteProp>();

  const query = route.params?.query;

  return (
    <LicenseeProvider query={query}>
      <LicenseesScreenContent />
    </LicenseeProvider>
  );
};

export default LicenseesScreen;
