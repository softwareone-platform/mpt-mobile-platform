import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useLicensees, LicenseeProvider } from '@/context/LicenseeContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const LicenseesScreenContent = () => {
  const {
    licensees,
    isLicenseesLoading,
    isLicenseesError,
    isLicenseesFetchingNext,
    hasMoreLicensees,
    isUnauthorised,
    fetchLicenseesNextPage,
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
    >
      <ListView
        data={licensees}
        isFetchingNext={isLicenseesFetchingNext}
        hasMore={hasMoreLicensees}
        fetchNext={fetchLicenseesNextPage}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('licenseeDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const LicenseesScreen = () => (
  <LicenseeProvider>
    <LicenseesScreenContent />
  </LicenseeProvider>
);

export default LicenseesScreen;
