import { useTranslation } from 'react-i18next';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import EmptyState from '@/components/common/EmptyState';
import { useAccount } from '@/context/AccountContext';
import { screenStyle } from '@/styles/components';
import { Color } from '@/styles/tokens';

interface EmptyStateHelperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isUnauthorised: boolean;
  errorTitle?: string;
  errorDescription?: string;
  emptyTitle: string;
  emptyDescription: string;
  loadingTestId?: string;
  errorTestId?: string;
  emptyTestId?: string;
  children: React.ReactNode;
}

const EmptyStateHelper: React.FC<EmptyStateHelperProps> = ({
  isLoading,
  isError,
  isEmpty,
  isUnauthorised,
  errorTitle,
  errorDescription,
  emptyTitle,
  emptyDescription,
  loadingTestId,
  errorTestId,
  emptyTestId,
  children,
}) => {
  const { t } = useTranslation();
  const { isSwitchingAccount, userDataLoading } = useAccount();

  if (isLoading || isSwitchingAccount || userDataLoading) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator testID={loadingTestId} size="large" color={Color.brand.primary} />
      </View>
    );
  }

  if (isError && !isUnauthorised) {
    return (
      <View style={styles.containerCenterContent}>
        <EmptyState
          testID={errorTestId}
          icon={{
            name: 'block',
            variant: 'filled',
            size: 48,
            color: Color.brand.primary,
          }}
          title={errorTitle || t('common.message.errorGettingDataTitle')}
          description={errorDescription || t('common.message.errorGettingDataDescription')}
        />
      </View>
    );
  }

  if (isEmpty || isUnauthorised) {
    return (
      <EmptyState
        testID={emptyTestId}
        icon={{
          name: 'no-results-animated',
          variant: 'outlined',
        }}
        animatedIcon={true}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCenterContent: screenStyle.containerCenterContent,
});

export default EmptyStateHelper;
