import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigFull } from '@/config/list';
import { UsersProvider, useUsers } from '../context';
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
        onItemPress={(item) => console.info(item.id)}
      />
    </StatusMessage>
  );
};

const UsersScreen = () => (
  <UsersProvider>
    <UsersScreenContent />
  </UsersProvider>
);

export default UsersScreen;
