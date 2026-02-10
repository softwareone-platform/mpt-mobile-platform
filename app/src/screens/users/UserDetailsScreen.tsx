import { RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useSsoSttatus } from '@/hooks/queries/useSsoStatus';
import { useUserDetailsData } from '@/hooks/queries/useUserDetailsData';
import UserDetailsContent from '@/screens/users/UserDetailsContent';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type UserDetailsRouteProp = RouteProp<RootStackParamList, 'userDetails'>;

const UserDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<UserDetailsRouteProp>().params;

  const { userData } = useAccount();
  const currentUserId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const {
    data: userDetails,
    isLoading,
    isError,
    isUnauthorised,
  } = useUserDetailsData(id, currentUserId, currentAccountId);

  const { data: sso } = useSsoSttatus(id, currentUserId, currentAccountId);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!userDetails || Object.keys(userDetails).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.USER_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.USER_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.USER_DETAILS_EMPTY_STATE}
      emptyTitle={t('userDetailsScreen.emptyStateTitle')}
      emptyDescription={t('userDetailsScreen.emptyStateDescription')}
    >
      {userDetails && sso && (
        <DetailsView data={userDetails} config={listItemConfigFull}>
          <UserDetailsContent data={userDetails} sso={sso} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default UserDetailsScreen;
