import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSalesQuoteDetailsData } from '@/hooks/queries/useSalesQuoteDetailsData';
import SalesQuoteDetailsContent from '@/screens/sales-quotes/SalesQuoteDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SalesQuoteDetailsRouteProp = RouteProp<RootStackParamList, 'salesQuoteDetails'>;

const SalesQuoteDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<SalesQuoteDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised, refetch, isRefetching } =
    useSalesQuoteDetailsData(id, userId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SALES_QUOTE_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.SALES_QUOTE_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.SALES_QUOTE_DETAILS_EMPTY_STATE}
      emptyTitle={t('salesQuoteDetailsScreen.emptyStateTitle')}
      emptyDescription={t('salesQuoteDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImageNoSubtitle}
          headerTitleTestId={TestIDs.SALES_ORDER_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.SALES_ORDER_DETAILS_HEADER_STATUS}
          onRefresh={refetch}
          isRefreshing={isRefetching}
        >
          <SalesQuoteDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default SalesQuoteDetailsScreen;
