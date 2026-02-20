import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import AccountDetailsContent from './AccountDetailsContent';

import StatusMessage from '@/components/common/EmptyStateHelper';
import DetailsView from '@/components/details/DetailsView';
import { listItemConfigFull } from '@/config/list';
import { useAccount } from '@/context/AccountContext';
import { useAccountDetailsData } from '@/hooks/queries/useAccountDetailsData';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type AccountDetailsRouteProp = RouteProp<RootStackParamList, 'accountDetails'>;
type AccountDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'accountDetails'>;

const AccountDetailsScreen = () => {
  const { t } = useTranslation();
  const { id, type } = useRoute<AccountDetailsRouteProp>().params;
  const navigation = useNavigation<AccountDetailsNavigationProp>();

  const { userData } = useAccount();
  const userId = userData?.id;
  const currentAccountId = userData?.currentAccount?.id;

  const { data, isLoading, isError, isUnauthorised } = useAccountDetailsData(
    id,
    userId,
    currentAccountId,
  );

  useLayoutEffect(() => {
    if (type) {
      navigation.setOptions({ title: t(`details.${type}`) });
    }
  }, [type, navigation, t]);

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={!data || Object.keys(data).length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.ACCOUNT_DETAILS_LOADING_INDICATOR}
      errorTestId={TestIDs.ACCOUNT_DETAILS_ERROR_STATE}
      emptyTestId={TestIDs.ACCOUNT_DETAILS_EMPTY_STATE}
      emptyTitle={t('accountDetailsScreen.emptyStateTitle')}
      emptyDescription={t('accountDetailsScreen.emptyStateDescription')}
    >
      {data && (
        <DetailsView
          data={data}
          config={listItemConfigFull}
          headerTitleTestId={TestIDs.ACCOUNT_DETAILS_HEADER_TITLE}
          headerStatusTestId={TestIDs.ACCOUNT_DETAILS_HEADER_STATUS}
        >
          <AccountDetailsContent data={data} />
        </DetailsView>
      )}
    </StatusMessage>
  );
};

export default AccountDetailsScreen;
