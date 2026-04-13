import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import NavigationItem from '@/components/navigation-item/NavigationItem';
import { getCertificatesSubList } from '@/config/subListsNavigation';
import { useAccountType } from '@/hooks/useAccountType';
import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import type { CertificateDetails } from '@/types/program';
import { formatDateForLocale } from '@/utils/formatting';
import { canNavigateTo } from '@/utils/navigationPermissions';

const CertificateDetailsContent = ({ data }: { data: CertificateDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { accountType, isVendor } = useAccountType();
  const { navigateToSubListItem } = useSubListNavigation();

  const eligibility = data.eligibility.partner
    ? t('details.eligibilityValue.partner')
    : t('details.eligibilityValue.client');

  const expiration = formatDateForLocale(data?.expirationDate, language) || undefined;

  const filteredSubList = getCertificatesSubList(data.id).filter((item) =>
    item.roles.includes(accountType as AccountType),
  );

  return (
    <>
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
        {!isVendor && (
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
        )}
        {data.applicableTo === 'Licensee' ? (
          <DetailsListItem
            label={t(`details.certificant`)}
            data={data.licensee}
            onPress={
              canNavigateTo('licensee', accountType)
                ? () => {
                    navigation.navigate('licenseeDetails', {
                      id: data.licensee?.id,
                    });
                  }
                : undefined
            }
          />
        ) : (
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
        )}
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
      {filteredSubList.length > 0 && (
        <NavigationGroupCard>
          {filteredSubList.map((item, index) => (
            <NavigationItem
              key={item.name}
              title={t(`navigation.tabs.${item.name}`)}
              isLast={index === filteredSubList.length - 1}
              onPress={() => {
                // const query = formatQueryWithId(item.query, data.id);
                navigateToSubListItem(item);
              }}
            />
          ))}
        </NavigationGroupCard>
      )}
    </>
  );
};

export default CertificateDetailsContent;
