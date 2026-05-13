import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageWithExternalIds } from '@/config/list';
import { useSalesQuotes, SalesQuotesProvider } from '@/context/SalesQuotesContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type SalesQuotesScreenRouteProp = RouteProp<RootStackParamList, 'salesQuotes'>;

const SalesQuotesListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    salesQuotes,
    salesQuotesLoading,
    salesQuotesError,
    salesQuotesFetchingNext,
    hasMoreSalesQuotes,
    isUnauthorised,
    fetchSalesQuotes,
    refetchSalesQuotes,
    isSalesQuotesRefetching,
  } = useSalesQuotes();

  const { t } = useTranslation();

  return (
    <StatusMessage
      isLoading={salesQuotesLoading}
      isError={!!salesQuotesError}
      isEmpty={salesQuotes.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.SALES_QUOTES_LOADING_INDICATOR}
      errorTestId={TestIDs.SALES_QUOTES_ERROR_STATE}
      emptyTestId={TestIDs.SALES_QUOTES_EMPTY_STATE}
      emptyTitle={t('salesQuotesScreen.emptyStateTitle')}
      emptyDescription={t('salesQuotesScreen.emptyStateDescription')}
      onRefresh={refetchSalesQuotes}
      isRefreshing={isSalesQuotesRefetching}
    >
      <ListView
        data={salesQuotes}
        isFetchingNext={salesQuotesFetchingNext}
        hasMore={hasMoreSalesQuotes}
        fetchNext={fetchSalesQuotes}
        config={listItemConfigNoImageWithExternalIds}
        onRefresh={refetchSalesQuotes}
        isRefreshing={isSalesQuotesRefetching}
        contentContainerStyle={contentContainerStyle}
        onItemPress={() => {}}
      />
    </StatusMessage>
  );
};

export const SalesQuotesList = ({ query, contentContainerStyle }: ListProps) => (
  <SalesQuotesProvider query={query}>
    <SalesQuotesListContent contentContainerStyle={contentContainerStyle} />
  </SalesQuotesProvider>
);

const SalesQuotesScreen = () => {
  const route = useRoute<SalesQuotesScreenRouteProp>();
  return <SalesQuotesList query={route.params?.query} />;
};

export default SalesQuotesScreen;
