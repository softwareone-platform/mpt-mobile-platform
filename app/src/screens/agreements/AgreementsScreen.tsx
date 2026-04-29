import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import StatusMessage from '@/components/common/EmptyStateHelper';
import { ListView } from '@/components/list/ListView';
import { listItemConfigNoImage } from '@/config/list';
import { useAgreements, AgreementsProvider } from '@/context/AgreementsContext';
import type { ListProps } from '@/types/lists';
import type { RootStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';

type AgreementsScreenRouteProp = RouteProp<RootStackParamList, 'agreements'>;

const AgreementsListContent = ({ contentContainerStyle }: ListProps) => {
  const {
    agreements,
    agreementsLoading,
    agreementsError,
    agreementsFetchingNext,
    hasMoreAgreements,
    isUnauthorised,
    fetchAgreements,
  } = useAgreements();

  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <StatusMessage
      isLoading={agreementsLoading}
      isError={!!agreementsError}
      isEmpty={agreements.length === 0}
      isUnauthorised={isUnauthorised}
      loadingTestId={TestIDs.AGREEMENTS_LOADING_INDICATOR}
      errorTestId={TestIDs.AGREEMENTS_ERROR_STATE}
      emptyTestId={TestIDs.AGREEMENTS_EMPTY_STATE}
      emptyTitle={t('agreementsScreen.emptyStateTitle')}
      emptyDescription={t('agreementsScreen.emptyStateDescription')}
    >
      <ListView
        data={agreements}
        isFetchingNext={agreementsFetchingNext}
        hasMore={hasMoreAgreements}
        fetchNext={fetchAgreements}
        config={listItemConfigNoImage}
        contentContainerStyle={contentContainerStyle}
        onItemPress={(id) => {
          navigation.navigate('agreementDetails', {
            id,
          });
        }}
      />
    </StatusMessage>
  );
};

export const AgreementsList = ({ query, contentContainerStyle }: ListProps) => {
  return (
    <AgreementsProvider query={query}>
      <AgreementsListContent contentContainerStyle={contentContainerStyle} />
    </AgreementsProvider>
  );
};

const AgreementsScreen = () => {
  const route = useRoute<AgreementsScreenRouteProp>();
  return <AgreementsList query={route.params?.query} />;
};

export default AgreementsScreen;
