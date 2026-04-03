import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { JournalsProvider, useJournals } from '@/context/JournalsContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const JournalsScreenContent = () => {
  const {
    journals,
    journalsLoading,
    journalsError,
    journalsFetchingNext,
    hasMoreJournals,
    isUnauthorised,
    fetchJournals,
  } = useJournals();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={journalsLoading}
      isError={!!journalsError}
      isEmpty={journals.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.JOURNALS_LOADING_INDICATOR}
      errorTestId={TestIDs.JOURNALS_ERROR_STATE}
      emptyTestId={TestIDs.JOURNALS_EMPTY_STATE}
      emptyTitle={t('journalsScreen.emptyStateTitle')}
      emptyDescription={t('journalsScreen.emptyStateDescription')}
    >
      <ListView
        data={journals}
        isFetchingNext={journalsFetchingNext}
        hasMore={hasMoreJournals}
        fetchNext={fetchJournals}
        config={listItemConfigNoImage}
        onItemPress={(id) => {
          navigation.navigate('journalDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

const JournalsScreen = () => (
  <JournalsProvider>
    <JournalsScreenContent />
  </JournalsProvider>
);

export default JournalsScreen;
