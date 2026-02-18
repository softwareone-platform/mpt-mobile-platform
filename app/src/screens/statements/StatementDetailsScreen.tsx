import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useStatementDetailsData } from '@/hooks/queries/useStatementDetailsData';
import StatementDetailsContent from '@/screens/statements/StatementDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type StatementDetailsRouteProp = RouteProp<RootStackParamList, 'statementDetails'>;

const StatementDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<StatementDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useStatementDetailsData(
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
      loadingTestId={TestIDs.STATEMENT_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.STATEMENT_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.STATEMENT_DETAILS_EMPTY_STATE}
      emptyTitle={t('statementDetailsScreen.emptyStateTitle')}
      emptyDescription={t('statementDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView data={data} config={listItemConfigNoImageNoSubtitle}>
          <StatementDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default StatementDetailsScreen;
