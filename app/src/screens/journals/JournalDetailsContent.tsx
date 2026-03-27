import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import { cardStyle, Spacing } from '@/styles';
import type { JournalDetails } from '@/types/billing';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import { formatDateForLocale, formatNumber } from '@/utils/formatting';
import { canNavigateTo } from '@/utils/navigationPermissions';

const JournalDetailsContent = ({ data }: { data: JournalDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type as AccountType | undefined;

  const dueDate = formatDateForLocale(data.attributes?.dueDate, language);
  const totalPP = formatNumber(data.price?.totalPP, 2, language) || EMPTY_VALUE;

  return (
    <>
      <CardWithHeader title={t('details.title')}>
        <ListItemWithLabelAndText
          title={t('details.authorization')}
          subtitle={data.authorization?.name}
        />
        <DetailsListItem
          label={t('details.product')}
          data={data.product}
          onPress={() => {
            navigation.navigate('productDetails', { id: data.product?.id });
          }}
        />
        <DetailsListItem
          label={t('details.owner')}
          data={data.ledger?.owner}
          onPress={
            canNavigateTo('seller', accountType)
              ? () => {
                  navigation.navigate('sellerDetails', { id: data.ledger?.owner?.id });
                }
              : undefined
          }
        />
        <DetailsListItem
          label={t('details.vendor')}
          data={data.vendor}
          onPress={
            canNavigateTo('vendorAccount', accountType)
              ? () => {
                  navigation.navigate('accountDetails', { id: data.vendor?.id, type: 'vendor' });
                }
              : undefined
          }
        />
        <ListItemWithLabelAndText title={t('details.dueDate')} subtitle={dueDate} />
        <ListItemWithLabelAndText
          title={t('details.baseCurrency')}
          subtitle={data.attributes?.baseCurrency}
        />
        <ListItemWithLabelAndText
          title={t('details.allCharges')}
          subtitle={data.stats?.all?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.readyCharges')}
          subtitle={data.stats?.ready?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.ignoredCharges')}
          subtitle={data.stats?.ignored?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.splitCharges')}
          subtitle={data.stats?.split?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.errorCharges')}
          subtitle={data.stats?.error?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.skippedCharges')}
          subtitle={data.stats?.skipped?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.pp')}
          subtitle={`${data.price?.currency ?? ''} ${totalPP}`.trim()}
        />
        <ListItemWithLabelAndText
          title={t('details.assignee')}
          subtitle={data.assignee?.name}
          isLast={true}
        />
      </CardWithHeader>
      <View style={styles.navigationCard}>
        <NavigationItemWithImage
          id={data.charges?.id || ''}
          title={t('details.charges')}
          subtitle={data.charges?.name || ''}
          imagePath={data.charges?.icon}
        />
        <NavigationItemWithImage
          id={data.ledger?.id || ''}
          title={t('details.ledgers')}
          subtitle={data.ledger?.id || ''}
        />
        <NavigationItemWithImage
          id={data.seller?.id || ''}
          title={t('details.sellers')}
          subtitle={data.seller?.name || ''}
          imagePath={data.seller?.icon}
          isLast={true}
          onPress={
            canNavigateTo('seller', accountType)
              ? () => {
                  navigation.navigate('sellerDetails', { id: data.seller?.id });
                }
              : undefined
          }
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  navigationCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
});

export default JournalDetailsContent;
