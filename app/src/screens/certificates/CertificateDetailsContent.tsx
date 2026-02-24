import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccount } from '@/context/AccountContext';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import type { CertificateDetails } from '@/types/program';
import { formatDateForLocale } from '@/utils/formatting';
import { canNavigateTo } from '@/utils/navigationPermissions';

const CertificateDetailsContent = ({ data }: { data: CertificateDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type as AccountType | undefined;

  const eligibility = data.eligibility.partner
    ? t('details.eligibilityValue.partner')
    : t('details.eligibilityValue.client');

  const expiration = formatDateForLocale(data?.expirationDate, language);

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.program`)}
        data={data.program}
        onPress={() => {
          navigation.navigate('programDetails', {
            id: data.program?.id,
          });
        }}
      />
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
      {/* TODO: certificant can be also a Licensee */}
      <DetailsListItem
        label={t(`details.certificant`)}
        data={data.buyer}
        onPress={
          canNavigateTo('buyer', accountType)
            ? () => {
                navigation.navigate('buyerDetails', {
                  id: data.buyer?.id,
                });
              }
            : undefined
        }
      />
      <ListItemWithLabelAndText title={t('details.eligibility')} subtitle={eligibility} />
      <ListItemWithLabelAndText
        title={t('details.applicableTo')}
        subtitle={t(`details.applicableToValue.${data.applicableTo.toLowerCase()}`)}
      />
      <ListItemWithLabelAndText
        title={t('details.expiration')}
        subtitle={expiration}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default CertificateDetailsContent;
