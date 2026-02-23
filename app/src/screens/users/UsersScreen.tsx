import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { useUsers, UsersProvider } from '@/context/UsersContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const UsersScreenContent = () => {
  const {
    users,
    usersLoading,
    usersError,
    usersFetchingNext,
    hasMoreUsers,
    isUnauthorised,
    fetchUsers,
  } = useUsers();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={usersLoading}
      isError={!!usersError}
      isEmpty={users.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.USERS_LOADING_INDICATOR}
      errorTestId={TestIDs.USERS_ERROR_STATE}
      emptyTestId={TestIDs.USERS_EMPTY_STATE}
      emptyTitle={t('usersScreen.emptyStateTitle')}
      emptyDescription={t('usersScreen.emptyStateDescription')}
    >
      <ListView
        data={users}
        isFetchingNext={usersFetchingNext}
        hasMore={hasMoreUsers}
        fetchNext={fetchUsers}
        config={listItemConfigFull}
        onItemPress={(id) => {
          navigation.navigate('userDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const UsersScreen = () => {
  const route = useRoute();
  const showAllUsers = route.name === 'allUsers';

  return (
    <UsersProvider showAllUsers={showAllUsers}>
      <UsersScreenContent />
    </UsersProvider>
  );
};

export default UsersScreen;
