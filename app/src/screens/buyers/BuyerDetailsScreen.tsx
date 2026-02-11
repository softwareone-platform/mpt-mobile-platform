import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useBuyerDetailsData } from '@/hooks/queries/useBuyerDetailsData';
import BuyerDetailsContent from '@/screens/buyers/BuyerDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type BuyerDetailsRouteProp = RouteProp<RootStackParamList, 'buyerDetails'>;

const BuyerDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<BuyerDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: buyerDetails,
    isLoading,
    isError,
    isUnauthorised,
  } = useBuyerDetailsData(id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!buyerDetails || Object.keys(buyerDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.BUYER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.BUYER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.BUYER_DETAILS_EMPTY_STATE}
      emptyTitle={t('buyerDetailsScreen.emptyStateTitle')}
      emptyDescription={t('buyerDetailsScreen.emptyStateDescription')}
    >
      {buyerDetails && (
        <DetailsView data={buyerDetails} config={listItemConfigFull}>
          <BuyerDetailsContent data={buyerDetails} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default BuyerDetailsScreen;
