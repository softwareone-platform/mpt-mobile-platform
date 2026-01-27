import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImageNoSubtitle } from '@/config/list';
import { useEnrollments, EnrollmentProvider } from '@/context/EnrollmentContext';
import { TestIDs } from '@/utils/testID';

const EnrollmentsScreenContent = () => {
  const {
    enrollments,
    isEnrollmentsLoading,
    isEnrollmentsError,
    isEnrollmentsFetchingNext,
    hasMoreEnrollments,
    isUnauthorised,
    fetchEnrollments,
  } = useEnrollments();

  const { t } = useTranslation();

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
        fetchNext={fetchEnrollments}
        config={listItemConfigNoImageNoSubtitle}
        onItemPress={(item) => console.info(item.id)}
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
