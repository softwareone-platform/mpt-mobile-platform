import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigAgreements } from '@/config/list';
import { useAgreements, AgreementsProvider } from '@/context/AgreementsContext';
import { TestIDs } from '@/utils/testID';

const AgreementsScreenContent = () => {
  const {
    agreements,
    agreementsLoading,
    agreementsError,
    agreementsFetchingNext,
    hasMoreAgreements,
    isUnauthorised,
    fetchAgreements,
  } = useAgreements();

  const { t } = useTranslation();

  return (
    <StatusMessage
      isLoading={agreementsLoading}
      isError={!!agreementsError}
      isEmpty={agreements.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.AGREEMENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.AGREEMENTS_ERROR_STATE}
      emptyTestId={TestIDs.AGREEMENTS_EMPTY_STATE}
      emptyTitle={t('agreementsScreen.emptyStateTitle')}
      emptyDescription={t('agreementsScreen.emptyStateDescription')}
    >
      <ListView
        data={agreements}
        isFetchingNext={agreementsFetchingNext}
        hasMore={hasMoreAgreements}
        fetchNext={fetchAgreements}
        config={listItemConfigAgreements}
        onItemPress={(item) => console.info(item.id)}
      />
    </StatusMessage>
  );
};

const AgreementsScreen = () => (
  <AgreementsProvider>
    <AgreementsScreenContent />
  </AgreementsProvider>
);

export default AgreementsScreen;
