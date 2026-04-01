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

  const dueDate = formatDateForLocale(data.dueDate, language);
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
          data={data.owner}
          onPress={
            canNavigateTo('seller', accountType)
              ? () => {
                  navigation.navigate('sellerDetails', { id: data.owner?.id });
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
          subtitle={data.price?.currency}
        />
        <ListItemWithLabelAndText
          title={t('details.allCharges')}
          subtitle={data.processingSummary?.total?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.readyCharges')}
          subtitle={data.processingSummary?.ready?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.splitCharges')}
          subtitle={data.processingSummary?.split?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.errorCharges')}
          subtitle={data.processingSummary?.error?.toString()}
        />
        <ListItemWithLabelAndText
          title={t('details.skippedCharges')}
          subtitle={data.processingSummary?.skipped?.toString()}
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
