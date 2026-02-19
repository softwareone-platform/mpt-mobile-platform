import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useEnrollmentDetailsData } from '@/hooks/queries/useEnrollmentDetailsData';
import EnrollmentDetailsContent from '@/screens/enrollments/EnrollmentDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type EnrollmentDetailsRouteProp = RouteProp<RootStackParamList, 'enrollmentDetails'>;

const EnrollmentDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<EnrollmentDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useEnrollmentDetailsData(
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
          <EnrollmentDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default EnrollmentDetailsScreen;
