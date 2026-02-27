import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useInvoices, InvoicesProvider } from '@/context/InvoicesContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type InvoicesScreenRouteProp = RouteProp<RootStackParamList, 'invoices'>;

const InvoicesScreenContent = () => {
  const {
    invoices,
    invoicesLoading,
    invoicesError,
    invoicesFetchingNext,
    hasMoreInvoices,
    isUnauthorised,
    fetchInvoices,
  } = useInvoices();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={invoicesLoading}
      isError={!!invoicesError}
      isEmpty={invoices.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.INVOICES_LOADING_INDICATOR}
      errorTestId={TestIDs.INVOICES_ERROR_STATE}
      emptyTestId={TestIDs.INVOICES_EMPTY_STATE}
      emptyTitle={t('invoicesScreen.emptyStateTitle')}
      emptyDescription={t('invoicesScreen.emptyStateDescription')}
    >
      <ListView
        data={invoices}
        isFetchingNext={invoicesFetchingNext}
        hasMore={hasMoreInvoices}
        fetchNext={fetchInvoices}
        config={listItemConfigNoImageNoSubtitle}
        onItemPress={(id) => {
          navigation.navigate('invoiceDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const InvoicesScreen = () => {
  const route = useRoute<InvoicesScreenRouteProp>();

  const query = route.params?.query;

  return (
    <InvoicesProvider query={query}>
      <InvoicesScreenContent />
    </InvoicesProvider>
  );
};

export default InvoicesScreen;
