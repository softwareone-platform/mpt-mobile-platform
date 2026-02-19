import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useEnrollments, EnrollmentProvider } from '@/context/EnrollmentContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const EnrollmentsScreenContent = () => {
  const {
    enrollments,
    isEnrollmentsLoading,
    isEnrollmentsError,
    isEnrollmentsFetchingNext,
    hasMoreEnrollments,
    isUnauthorised,
    fetchEnrollmentsNextPage,
  } = useEnrollments();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isEnrollmentsLoading}
      isError={!!isEnrollmentsError}
      isEmpty={enrollments.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.ENROLLMENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.ENROLLMENTS_ERROR_STATE}
      emptyTestId={TestIDs.ENROLLMENTS_EMPTY_STATE}
      emptyTitle={t('enrollmentsScreen.emptyStateTitle')}
      emptyDescription={t('enrollmentsScreen.emptyStateDescription')}
    >
      <ListView
        data={enrollments}
        isFetchingNext={isEnrollmentsFetchingNext}
        hasMore={hasMoreEnrollments}
        fetchNext={fetchEnrollmentsNextPage}
        config={listItemConfigNoImageNoSubtitle}
        onItemPress={(id) => {
          navigation.navigate('enrollmentDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

const EnrollmentsScreen = () => (
  <EnrollmentProvider>
    <EnrollmentsScreenContent />
  </EnrollmentProvider>
);

export default EnrollmentsScreen;
