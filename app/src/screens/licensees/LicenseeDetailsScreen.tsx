import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useLicenseeDetailsData } from '@/hooks/queries/useLicenseeDetailsData';
import LicenseeDetailsContent from '@/screens/licensees/LicenseeDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type LicenseeDetailsRouteProp = RouteProp<RootStackParamList, 'licenseeDetails'>;

const LicenseeDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<LicenseeDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useLicenseeDetailsData(
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
      loadingTestId={TestIDs.LICENSEE_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.LICENSEE_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.LICENSEE_DETAILS_EMPTY_STATE}
      emptyTitle={t('licenseeDetailsScreen.emptyStateTitle')}
      emptyDescription={t('licenseeDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigFull}
          headerTitleTestId={TestIDs.LICENSEE_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.LICENSEE_DETAILS_HEADER_STATUS}
        >
          <LicenseeDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default LicenseeDetailsScreen;
