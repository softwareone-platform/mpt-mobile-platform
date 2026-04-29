import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useStatements, StatementsProvider } from '@/context/StatementsContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type StatementsScreenRouteProp = RouteProp<RootStackParamList, 'statements'>;

const StatementsScreenContent = () => {
  const {
    statements,
    statementsLoading,
    statementsError,
    statementsFetchingNext,
    hasMoreStatements,
    isUnauthorised,
    fetchStatements,
    refetchStatements,
    isStatementsRefetching,
  } = useStatements();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={statementsLoading}
      isError={!!statementsError}
      isEmpty={statements.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.STATEMENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.STATEMENTS_ERROR_STATE}
      emptyTestId={TestIDs.STATEMENTS_EMPTY_STATE}
      emptyTitle={t('statementsScreen.emptyStateTitle')}
      emptyDescription={t('statementsScreen.emptyStateDescription')}
    >
      <ListView
        data={statements}
        isFetchingNext={statementsFetchingNext}
        hasMore={hasMoreStatements}
        fetchNext={fetchStatements}
        config={listItemConfigNoImageNoSubtitle}
        onRefresh={refetchStatements}
        isRefreshing={isStatementsRefetching}
        onItemPress={(id) => {
          navigation.navigate('statementDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const StatementsScreen = () => {
  const route = useRoute<StatementsScreenRouteProp>();

  const query = route.params?.query;

  return (
    <StatementsProvider query={query}>
      <StatementsScreenContent />
    </StatementsProvider>
  );
};

export default StatementsScreen;
