import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useCreditMemoDetailsData } from '@/hooks/queries/useCreditMemoDetailsData';
import CreditMemoDetailsContent from '@/screens/credit-memos/CreditMemoDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type CreditMemoDetailsRouteProp = RouteProp<RootStackParamList, 'creditMemoDetails'>;

const CreditMemoDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<CreditMemoDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useCreditMemoDetailsData(
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
      loadingTestId={TestIDs.CREDIT_MEMO_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.CREDIT_MEMO_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.CREDIT_MEMO_DETAILS_EMPTY_STATE}
      emptyTitle={t('creditMemoDetailsScreen.emptyStateTitle')}
      emptyDescription={t('creditMemoDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImageNoSubtitle}
          headerTitleTestId={TestIDs.CREDIT_MEMO_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.CREDIT_MEMO_DETAILS_HEADER_STATUS}
        >
          <CreditMemoDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default CreditMemoDetailsScreen;
