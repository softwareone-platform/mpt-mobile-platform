import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsHeader from '@/components/details/DetailsHeader';
import DetailsView from '@/components/details/DetailsView';
import { useAccount } from '@/context/AccountContext';
import { useCreditMemoDetailsData } from '@/hooks/queries/useCreditMemoDetailsData';
import type { ListItemWithStatusProps } from '@/types/lists';
import type { TabParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type CreditMemoDetailsRouteProp = RouteProp<TabParamList, 'creditMemoDetails'>;

const CreditMemoDetailsScreen = () => {
  const { t } = useTranslation();
  const { params } = useRoute<CreditMemoDetailsRouteProp>();
  const headerData: ListItemWithStatusProps = params.headerProps;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: creditMemoDetails,
    isLoading,
    isError,
    isUnauthorised,
  } = useCreditMemoDetailsData(headerData.id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!creditMemoDetails || Object.keys(creditMemoDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CREDIT_MEMO_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.CREDIT_MEMO_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.CREDIT_MEMO_DETAILS_EMPTY_STATE}
      emptyTitle={t('creditMemoDetailsScreen.emptyStateTitle')}
      emptyDescription={t('creditMemoDetailsScreen.emptyStateDescription')}
    >
      <View>
        <DetailsHeader
          id={headerData.id}
          title={headerData.title}
          subtitle={headerData.subtitle}
          imagePath={headerData.imagePath}
          statusText={headerData.statusText}
        />
        {creditMemoDetails && <DetailsView data={creditMemoDetails} />}
      </View>
    </StatusMessage>
  );
};

export default CreditMemoDetailsScreen;
