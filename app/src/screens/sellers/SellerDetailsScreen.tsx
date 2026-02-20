import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSellerDetailsData } from '@/hooks/queries/useSellerDetailsData';
import SellerDetailsContent from '@/screens/sellers/SellerDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SellerDetailsRouteProp = RouteProp<RootStackParamList, 'sellerDetails'>;

const SellerDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<SellerDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useSellerDetailsData(
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
      loadingTestId={TestIDs.SELLER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.SELLER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.SELLER_DETAILS_EMPTY_STATE}
      emptyTitle={t('sellerDetailsScreen.emptyStateTitle')}
      emptyDescription={t('sellerDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigFull}
          headerTitleTestId={TestIDs.SELLER_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.SELLER_DETAILS_HEADER_STATUS}
        >
          <SellerDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default SellerDetailsScreen;
