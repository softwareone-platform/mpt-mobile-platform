import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSsoStatus } from '@/hooks/queries/useSsoStatus';
import { useUserDetailsData } from '@/hooks/queries/useUserDetailsData';
import UserDetailsContent from '@/screens/users/UserDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type UserDetailsRouteProp = RouteProp<RootStackParamList, 'userDetails'>;

const UserDetailsScreen = () => {
  const { t } = useTranslation();
  const { id, showAccounts } = useRoute<UserDetailsRouteProp>().params;

  const { userData } = useAccount();
  const currentUserId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: userDetails,
    isLoading: isUserLoading,
    isError: isUserError,
    isUnauthorised,
    refetch,
    isRefetching,
  } = useUserDetailsData(id, currentUserId, currentAccountId);

  const {
    data: sso,
    isLoading: isSsoLoading,
    isError: isSsoError,
    refetch: refetchSso,
    isRefetching: isSsoRefetching,
  } = useSsoStatus(id, currentUserId, currentAccountId);

  const handleRefresh = useCallback(() => {
    void refetch();
    void refetchSso();
  }, [refetch, refetchSso]);

  return (
    <StatusMessage
      isLoading={isUserLoading || isSsoLoading}
      isError={!!isUserError || isSsoError}
      isEmpty={!userDetails || Object.keys(userDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.USER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.USER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.USER_DETAILS_EMPTY_STATE}
      emptyTitle={t('userDetailsScreen.emptyStateTitle')}
      emptyDescription={t('userDetailsScreen.emptyStateDescription')}
    >
      {userDetails && sso && (
        <DetailsView
          data={userDetails}
          config={listItemConfigFull}
          headerTitleTestId={TestIDs.USER_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.USER_DETAILS_HEADER_STATUS}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching || isSsoRefetching}
        >
          <UserDetailsContent data={userDetails} sso={sso} showAccounts={showAccounts} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default UserDetailsScreen;
