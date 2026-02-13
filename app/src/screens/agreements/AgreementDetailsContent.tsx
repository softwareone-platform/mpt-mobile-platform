import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { AgreementData } from '@/types/agreement';
import type { RootStackParamList } from '@/types/navigation';
import { formatNumber, formatPercentage } from '@/utils/formatting';
import { calculateMarginWithMarkup } from '@/utils/formulas';

const AgreementDetailsContent = ({ data }: { data: AgreementData }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const hasBillingCurrencyData = data.price?.billingCurrency;
  const labelMonth = `${data.price?.currency}/${t('details.month')}`;
  const labelYear = `${data.price?.currency}/${t('details.year')}`;
  const labelUp = t('details.up');
  const labelDown = t('details.down');
  const labelResaleLicensee = data.licensee?.eligibility?.partner
    ? t(`details.yes`)
    : t(`details.no`);

  const PPxM = `${formatNumber(data.price?.PPxM, 2, language) || EMPTY_VALUE} ${labelMonth}`;
  const PPxY = `${formatNumber(data.price?.PPxY, 2, language) || EMPTY_VALUE} ${labelYear}`;
  const SPxM = `${formatNumber(data.price?.SPxM, 2, language) || EMPTY_VALUE} ${labelMonth}`;
  const SPxY = `${formatNumber(data.price?.SPxY, 2, language) || EMPTY_VALUE} ${labelYear}`;

  const formattedAverageMarkup = `${formatPercentage(data.price?.markup, 2) || EMPTY_VALUE} ${labelUp}`;
  const formattedAverageMargin = `${formatPercentage(data.price?.margin, 2) || EMPTY_VALUE} ${labelDown}`;
  const formattedDefaultMarkup = `${formatPercentage(data.price?.defaultMarkup, 2) || EMPTY_VALUE} ${labelUp}`;
  const defaultMargin = calculateMarginWithMarkup(data.price?.defaultMarkup || 0);
  const formattedDefaultMargin = `${formatPercentage(defaultMargin, 2) || EMPTY_VALUE} ${labelDown}`;

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.vendor`)}
        data={data.vendor}
        onPress={() => {
          navigation.navigate('accountDetails', {
            id: data.vendor?.id,
            type: 'vendor',
          });
        }}
      />
      <DetailsListItem label={t(`details.product`)} data={data.product} />
      <ListItemWithLabelAndText
        title={t(`details.resaleLicensee`)}
        subtitle={data.licensee?.eligibility?.partner === undefined ? '' : labelResaleLicensee}
      />
      <DetailsListItem
        label={t(`details.client`)}
        data={data.client}
        onPress={() => {
          navigation.navigate('accountDetails', {
            id: data.client?.id,
            type: 'client',
          });
        }}
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

      {/* TODO: remove conditional logic once billingCurrency is stable in API response */}
      <ListItemWithLabelAndText
        title={hasBillingCurrencyData ? t(`details.baseCurrency`) : t(`details.currency`)}
        subtitle={data.price?.currency}
        isLast={hasBillingCurrencyData ? false : true}
      />
      {hasBillingCurrencyData && (
        <ListItemWithLabelAndText
          title={t(`details.billingCurrency`)}
          subtitle={data.price?.billingCurrency}
          isLast={true}
        />
      )}
    </CardWithHeader>
  );
};

export default AgreementDetailsContent;
