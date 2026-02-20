import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useInvoiceDetailsData } from '@/hooks/queries/useInvoiceDetailsData';
import InvoiceDetailsContent from '@/screens/invoices/InvoiceDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type InvoiceDetailsRouteProp = RouteProp<RootStackParamList, 'invoiceDetails'>;

const InvoiceDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<InvoiceDetailsRouteProp>().params;

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useInvoiceDetailsData(
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
      loadingTestId={TestIDs.INVOICE_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.INVOICE_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.INVOICE_DETAILS_EMPTY_STATE}
      emptyTitle={t('invoiceDetailsScreen.emptyStateTitle')}
      emptyDescription={t('invoiceDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigNoImageNoSubtitle}
          headerTitleTestId={TestIDs.INVOICE_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.INVOICE_DETAILS_HEADER_STATUS}
        >
          <InvoiceDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default InvoiceDetailsScreen;
