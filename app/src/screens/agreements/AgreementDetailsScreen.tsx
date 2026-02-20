import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImage } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useAgreementDetailsData } from '@/hooks/queries/useAgreementDetailsData';
import AgreementDetailsContent from '@/screens/agreements/AgreementDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type AgreementDetailsRouteProp = RouteProp<RootStackParamList, 'agreementDetails'>;

const AgreementDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<AgreementDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useAgreementDetailsData(
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
      loadingTestId={TestIDs.AGREEMENT_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.AGREEMENT_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.AGREEMENT_DETAILS_EMPTY_STATE}
      emptyTitle={t('agreementDetailsScreen.emptyStateTitle')}
      emptyDescription={t('agreementDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImage}
          headerTitleTestId={TestIDs.AGREEMENT_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.AGREEMENT_DETAILS_HEADER_STATUS}
        >
          <AgreementDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default AgreementDetailsScreen;
