import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImage } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useCertificateDetailsData } from '@/hooks/queries/useCertificateDetailsData';
import CertificateDetailsContent from '@/screens/certificates/CertificateDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type CertificateDetailsRouteProp = RouteProp<RootStackParamList, 'certificateDetails'>;

const EnrollmentDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<CertificateDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useCertificateDetailsData(
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
      loadingTestId={TestIDs.CERTIFICATE_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.CERTIFICATE_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.CERTIFICATE_DETAILS_EMPTY_STATE}
      emptyTitle={t('certificateDetailsScreen.emptyStateTitle')}
      emptyDescription={t('certificateDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView data={data} config={listItemConfigNoImage}>
          <CertificateDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default EnrollmentDetailsScreen;
