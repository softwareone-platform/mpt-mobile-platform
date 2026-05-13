import { useTranslation } from 'react-i18next';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';

import EmptyState from '@/components/common/EmptyState';
import RefreshControl from '@/components/common/RefreshControl';
import { useAccount } from '@/context/AccountContext';
import { screenStyle } from '@/styles/components';
import { Color } from '@/styles/tokens';
import type { AnimatedIconName } from '@/types/icons';

interface EmptyStateHelperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isUnauthorised: boolean;
  errorTitle?: string;
  errorDescription?: string;
  emptyIconName?: AnimatedIconName;
  emptyTitle: string;
  emptyDescription: string;
  loadingTestId?: string;
  errorTestId?: string;
  emptyTestId?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children: React.ReactNode;
}

const EmptyStateHelper: React.FC<EmptyStateHelperProps> = ({
  isLoading,
  isError,
  isEmpty,
  isUnauthorised,
  errorTitle,
  errorDescription,
  emptyIconName,
  emptyTitle,
  emptyDescription,
  loadingTestId,
  errorTestId,
  emptyTestId,
  onRefresh,
  isRefreshing,
  children,
}) => {
  const { t } = useTranslation();
  const { isSwitchingAccount, isUserDataLoading } = useAccount();

  if (isLoading || isSwitchingAccount || isUserDataLoading) {
    return (
      <View style={[styles.containerMain, styles.containerCenterContent]}>
        <ActivityIndicator testID={loadingTestId} size="large" color={Color.brand.primary} />
      </View>
    );
  }

  if (isError && !isUnauthorised) {
    const errorState = (
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
    );

    if (onRefresh) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
          }
        >
          {errorState}
        </ScrollView>
      );
    }

    return <View style={styles.containerCenterContent}>{errorState}</View>;
  }

  if (isEmpty || isUnauthorised) {
    const emptyState = (
      <EmptyState
        testID={emptyTestId}
        icon={{
          name: emptyIconName || 'no-results-animated',
          variant: 'outlined',
        }}
        animatedIcon={true}
        title={emptyTitle}
        description={emptyDescription}
      />
    );

    if (onRefresh) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing ?? false} onRefresh={onRefresh} />
          }
        >
          {emptyState}
        </ScrollView>
      );
    }

    return emptyState;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  containerMain: screenStyle.containerMain,
  containerCenterContent: screenStyle.containerCenterContent,
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
});

export default EmptyStateHelper;
