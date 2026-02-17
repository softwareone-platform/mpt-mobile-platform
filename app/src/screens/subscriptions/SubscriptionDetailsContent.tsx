import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { RootStackParamList } from '@/types/navigation';
import type { SubscriptionData } from '@/types/subscription';
import { formatNumber, formatPercentage, formatDateForLocale } from '@/utils/formatting';
import { calculateMarginWithMarkup } from '@/utils/formulas';

const SubscriptionDetailsContent = ({ data }: { data: SubscriptionData }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const labelMonth = `${data.price?.currency}/${t('details.month')}`;
  const labelYear = `${data.price?.currency}/${t('details.year')}`;
  const labelUp = t('details.up');
  const labelDown = t('details.down');

  const PPxM = `${formatNumber(data.price?.PPxM, 2, language) || EMPTY_VALUE} ${labelMonth}`;
  const PPxY = `${formatNumber(data.price?.PPxY, 2, language) || EMPTY_VALUE} ${labelYear}`;
  const SPxM = `${formatNumber(data.price?.SPxM, 2, language) || EMPTY_VALUE} ${labelMonth}`;
  const SPxY = `${formatNumber(data.price?.SPxY, 2, language) || EMPTY_VALUE} ${labelYear}`;

  const formattedAverageMarkup = `${formatPercentage(data.price?.markup, 2) || EMPTY_VALUE} ${labelUp}`;
  const formattedAverageMargin = `${formatPercentage(data.price?.margin, 2) || EMPTY_VALUE} ${labelDown}`;
  const formattedDefaultMarkup = `${formatPercentage(data.price?.defaultMarkup, 2) || EMPTY_VALUE} ${labelUp}`;
  const defaultMargin = calculateMarginWithMarkup(data.price?.defaultMarkup || 0);
  const formattedDefaultMargin = `${formatPercentage(defaultMargin, 2) || EMPTY_VALUE} ${labelDown}`;

  const formattedRenewalDate =
    formatDateForLocale(data.commitmentDate, i18n.language) || EMPTY_VALUE;

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem label={t(`details.product`)} data={data.product} />
      <DetailsListItem
        label={t(`details.agreement`)}
        data={data.agreement}
        hideImage={true}
        onPress={() => {
          navigation.navigate('agreementDetails', {
            id: data.agreement?.id,
          });
        }}
      />
      <DetailsListItem
        label={t(`details.client`)}
        data={data.agreement?.client}
        onPress={() => {
          navigation.navigate('accountDetails', {
            id: data.agreement?.client?.id,
            type: 'client',
          });
        }}
      />
      <ListItemWithLabelAndText
        title={t(`details.terms`)}
        subtitle={t(`details.period.${data.terms.period}`)}
      />
      <ListItemWithLabelAndText title={t(`details.renewalDate`)} subtitle={formattedRenewalDate} />
      <ListItemWithLabelAndText
        title={t(`details.billingModel`)}
        subtitle={t(`details.model.${data.terms.model}`)}
      />
      <ListItemWithLabelAndText title={t(`details.ppx`)} subtitle={`${PPxM}    ${PPxY}`} />
      <ListItemWithLabelAndText
        title={t(`details.averageYield`)}
        subtitle={`${formattedAverageMarkup}    ${formattedAverageMargin}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.defaultYield`)}
        subtitle={`${formattedDefaultMarkup}    ${formattedDefaultMargin}`}
      />
      <ListItemWithLabelAndText title={t(`details.spx`)} subtitle={`${SPxM}    ${SPxY}`} />
      <ListItemWithLabelAndText
        title={t(`details.currency`)}
        subtitle={data.price?.currency}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default SubscriptionDetailsContent;
