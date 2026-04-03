import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImage } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useJournalDetailsData } from '@/hooks/queries/useJournalDetailsData';
import JournalDetailsContent from '@/screens/journals/JournalDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type JournalDetailsRouteProp = RouteProp<RootStackParamList, 'journalDetails'>;

const JournalDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<JournalDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useJournalDetailsData(
    id,
    userId,
    currentAccountId,
  );

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.JOURNAL_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.JOURNAL_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.JOURNAL_DETAILS_EMPTY_STATE}
      emptyTitle={t('journalDetailsScreen.emptyStateTitle')}
      emptyDescription={t('journalDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImage}
          headerTitleTestId={TestIDs.JOURNAL_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.JOURNAL_DETAILS_HEADER_STATUS}
        >
          <JournalDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default JournalDetailsScreen;
