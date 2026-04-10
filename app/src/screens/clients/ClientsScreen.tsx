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
  const { items, isLoading, isError, isFetchingNext, hasMore, isUnauthorised, fetchNextPage } =
    useClients();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={items.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CLIENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.CLIENTS_ERROR_STATE}
      emptyTestId={TestIDs.CLIENTS_EMPTY_STATE}
      emptyTitle={t('clientsScreen.emptyStateTitle')}
      emptyDescription={t('clientsScreen.emptyStateDescription')}
    >
      <ListView
        data={items}
        isFetchingNext={isFetchingNext}
        hasMore={hasMore}
        fetchNext={fetchNextPage}
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
