import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useProgramDetailsData } from '@/hooks/queries/useProgramDetailsData';
import ProgramDetailsContent from '@/screens/programs/ProgramDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type ProgramDetailsRouteProp = RouteProp<RootStackParamList, 'programDetails'>;

const ProgramDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<ProgramDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useProgramDetailsData(
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
      loadingTestId={TestIDs.PROGRAM_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.PROGRAM_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.PROGRAM_DETAILS_EMPTY_STATE}
      emptyTitle={t('programDetailsScreen.emptyStateTitle')}
      emptyDescription={t('programDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView data={data} config={listItemConfigNoImageNoSubtitle}>
          <ProgramDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default ProgramDetailsScreen;
