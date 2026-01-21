import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigInvoices } from '@/config/list';
import { useInvoices, InvoicesProvider } from '@/context/InvoicesContext';
import { TestIDs } from '@/utils/testID';

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
        config={listItemConfigInvoices}
        onItemPress={(item) => console.info(item.id)}
      />
    </StatusMessage>
  );
};

const InvoicesScreen = () => (
  <InvoicesProvider>
    <InvoicesScreenContent />
  </InvoicesProvider>
);

export default InvoicesScreen;
