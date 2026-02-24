import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccount } from '@/context/AccountContext';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import type { ProgramDetails } from '@/types/program';
import { canNavigateTo } from '@/utils/navigationPermissions';

const ProgramDetailsContent = ({ data }: { data: ProgramDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type as AccountType | undefined;

  const eligibility = data.eligibility.partner
    ? t('details.eligibilityValue.partner')
    : t('details.eligibilityValue.client');

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.vendor`)}
        data={data.vendor}
        onPress={
          canNavigateTo('vendorAccount', accountType)
            ? () => {
                navigation.navigate('accountDetails', {
                  id: data.vendor?.id,
                  type: 'vendor',
                });
              }
            : undefined
        }
      />
      <ListItemWithLabelAndText title={t(`details.name`)} subtitle={data.name} />

      <ListItemWithLabelAndText title={t(`details.website`)} subtitle={data.website} />

      <ListItemWithLabelAndText title={t('details.eligibility')} subtitle={eligibility} />

      <ListItemWithLabelAndText
        title={t('details.applicableTo')}
        subtitle={t(`details.applicableToValue.${data.applicableTo.toLowerCase()}`)}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default ProgramDetailsContent;
