import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { UserAccountsProvider, useUserAccounts } from '@/context/UserAccountsContext';
import type { ListItemConfig } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const userAccountListConfig: ListItemConfig = {
  id: 'id',
  title: 'name',
  subtitle: 'id',
  imagePath: 'icon',
  status: 'status',
};

type UserAccountsScreenRouteProp = RouteProp<RootStackParamList, 'accounts'>;

const UserAccountsScreenContent = () => {
  const {
    accounts,
    isLoading,
    isError,
    isFetchingNext,
    hasMore,
    isUnauthorised,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useUserAccounts();

  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={accounts.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.USER_ACCOUNTS_LOADING_INDICATOR}
      errorTestId={TestIDs.USER_ACCOUNTS_ERROR_STATE}
      emptyTestId={TestIDs.USER_ACCOUNTS_EMPTY_STATE}
      emptyTitle={t('userAccountsScreen.emptyStateTitle')}
      emptyDescription={t('userAccountsScreen.emptyStateDescription')}
    >
      <ListView
        data={accounts}
        isFetchingNext={isFetchingNext}
        hasMore={hasMore}
        fetchNext={fetchNextPage}
        config={userAccountListConfig}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        onItemPress={(id) => {
          const account = accounts.find((a) => a.id === id);
          const rawType = account?.type?.toLowerCase();
          const type =
            rawType === 'client' || rawType === 'vendor' || rawType === 'operations'
              ? rawType
              : undefined;
          navigation.navigate('accountDetails', { id, type });
        }}
      />
    </StatusMessage>
  );
};

const UserAccountsScreen = () => {
  const route = useRoute<UserAccountsScreenRouteProp>();
  const userId = route.params.userId;

  return (
    <UserAccountsProvider userId={userId}>
      <UserAccountsScreenContent />
    </UserAccountsProvider>
  );
};

export default UserAccountsScreen;
