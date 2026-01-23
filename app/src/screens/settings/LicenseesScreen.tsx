import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useLicensees, LicenseeProvider } from '@/context/LicenseeContext';
import { TestIDs } from '@/utils/testID';

const LicenseesScreenContent = () => {
  const {
    licensees,
    licenseesLoading,
    licenseesError,
    licenseesFetchingNext,
    hasMoreLicensees,
    isUnauthorised,
    fetchLicensees,
  } = useLicensees();

  const { t } = useTranslation();

  return (
    <StatusMessage
      isLoading={licenseesLoading}
      isError={!!licenseesError}
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
        isFetchingNext={licenseesFetchingNext}
        hasMore={hasMoreLicensees}
        fetchNext={fetchLicensees}
        config={listItemConfigFull}
        onItemPress={(item) => console.info(item.id)}
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
