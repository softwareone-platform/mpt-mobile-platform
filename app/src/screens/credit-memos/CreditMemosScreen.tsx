import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useBilling, BillingProvider } from '@/context/BillingContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const CreditMemosScreenContent = () => {
  const {
    creditMemos,
    creditMemosLoading,
    creditMemosError,
    creditMemosFetchingNext,
    hasMoreCreditMemos,
    isUnauthorised,
    fetchCreditMemos,
  } = useBilling();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={creditMemosLoading}
      isError={!!creditMemosError}
      isEmpty={creditMemos.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CREDIT_MEMOS_LOADING_INDICATOR}
      errorTestId={TestIDs.CREDIT_MEMOS_ERROR_STATE}
      emptyTestId={TestIDs.CREDIT_MEMOS_EMPTY_STATE}
      emptyTitle={t('creditMemosScreen.emptyStateTitle')}
      emptyDescription={t('creditMemosScreen.emptyStateDescription')}
    >
      <ListView
        data={creditMemos}
        isFetchingNext={creditMemosFetchingNext}
        hasMore={hasMoreCreditMemos}
        fetchNext={fetchCreditMemos}
        config={listItemConfigNoImageNoSubtitle}
        onItemPress={(id) => {
          navigation.navigate('creditMemoDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

const CreditMemosScreen = () => (
  <BillingProvider>
    <CreditMemosScreenContent />
  </BillingProvider>
);

export default CreditMemosScreen;
