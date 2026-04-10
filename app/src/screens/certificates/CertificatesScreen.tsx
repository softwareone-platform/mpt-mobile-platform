import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { useCertificates, CertificateProvider } from '@/context/CertificateContext';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

const CertificatesScreenContent = () => {
  const { items, isLoading, isError, isFetchingNext, hasMore, isUnauthorised, fetchNextPage } =
    useCertificates();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={isLoading}
      isError={!!isError}
      isEmpty={items.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.CERTIFICATES_LOADING_INDICATOR}
      errorTestId={TestIDs.CERTIFICATES_ERROR_STATE}
      emptyTestId={TestIDs.CERTIFICATES_EMPTY_STATE}
      emptyTitle={t('certificatesScreen.emptyStateTitle')}
      emptyDescription={t('certificatesScreen.emptyStateDescription')}
    >
      <ListView
        data={items}
        isFetchingNext={isFetchingNext}
        hasMore={hasMore}
        fetchNext={fetchNextPage}
        config={listItemConfigNoImage}
        onItemPress={(id) => {
          navigation.navigate('certificateDetails', { id });
        }}
      />
    </StatusMessage>
  );
};

const CertificatesScreen = () => {
  return (
    <CertificateProvider>
      <CertificatesScreenContent />
    </CertificateProvider>
  );
};

export default CertificatesScreen;
