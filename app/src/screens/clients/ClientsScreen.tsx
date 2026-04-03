import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { ClientsProvider, useClients } from '@/context/ClientsContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const ClientsScreenContent = () => {
  const {
    clients,
    isClientsLoading,
    isClientsError,
    isClientsFetchingNext,
    hasMoreClients,
    isUnauthorised,
    fetchClientsNextPage,
  } = useClients();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isClientsLoading}
      isError={!!isClientsError}
      isEmpty={clients.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CLIENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.CLIENTS_ERROR_STATE}
      emptyTestId={TestIDs.CLIENTS_EMPTY_STATE}
      emptyTitle={t('clientsScreen.emptyStateTitle')}
      emptyDescription={t('clientsScreen.emptyStateDescription')}
    >
      <ListView
        data={clients}
        isFetchingNext={isClientsFetchingNext}
        hasMore={hasMoreClients}
        fetchNext={fetchClientsNextPage}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('accountDetails', {
            id,
            type: 'client',
          });
        }}
      />
    </StatusMessage>
  );
};

const ClientsScreen = () => (
  <ClientsProvider>
    <ClientsScreenContent />
  </ClientsProvider>
);

export default ClientsScreen;
