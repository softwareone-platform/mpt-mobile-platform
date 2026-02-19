import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { usePrograms, ProgramProvider } from '@/context/ProgramContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const ProgramsScreenContent = () => {
  const {
    programs,
    programsLoading,
    programsError,
    programsFetchingNext,
    hasMorePrograms,
    isUnauthorised,
    fetchPrograms,
  } = usePrograms();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={programsLoading}
      isError={!!programsError}
      isEmpty={programs.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.PROGRAMS_LOADING_INDICATOR}
      errorTestId={TestIDs.PROGRAMS_ERROR_STATE}
      emptyTestId={TestIDs.PROGRAMS_EMPTY_STATE}
      emptyTitle={t('programsScreen.emptyStateTitle')}
      emptyDescription={t('programsScreen.emptyStateDescription')}
    >
      <ListView
        data={programs}
        isFetchingNext={programsFetchingNext}
        hasMore={hasMorePrograms}
        fetchNext={fetchPrograms}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('programDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

const ProgramsScreen = () => (
  <ProgramProvider>
    <ProgramsScreenContent />
  </ProgramProvider>
);

export default ProgramsScreen;
