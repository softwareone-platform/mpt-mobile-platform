import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccountType } from '@/hooks/useAccountType';
import type { RootStackParamList } from '@/types/navigation';
import type { SalesOrderDetails } from '@/types/procurement';
import { formatPercentage, formatNumber } from '@/utils/formatting';
import { calculateSumByPath } from '@/utils/formulas';
import { canNavigateTo } from '@/utils/navigationPermissions';

const SalesOrderDetailsContent = ({ data }: { data: SalesOrderDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { accountType, isOperations } = useAccountType();

  const calculatedGT = calculateSumByPath(data.lines, 'attributes.navision.amountIncludingVat');

  const totalPP = formatNumber(data.price.PPx1, 2, language) || EMPTY_VALUE;
  const totalSP = formatNumber(data.price.SPx1, 2, language) || EMPTY_VALUE;
  const totalGT = formatNumber(calculatedGT, 2, language) || EMPTY_VALUE;

  const formattedMarkup = `${formatPercentage(data.price.markup, 2) || EMPTY_VALUE} ${t('details.up')}`;
  const formattedMargin = `${formatPercentage(data.price.margin, 2) || EMPTY_VALUE} ${t('details.down')}`;

  return (
    <CardWithHeader title={t(`details.title`)}>
      {isOperations && (
        <DetailsListItem
          label={t(`details.client`)}
          data={data.client}
          onPress={
            canNavigateTo('clientAccount', accountType)
              ? () => {
                  navigation.navigate('accountDetails', {
                    id: data.client?.id,
                    type: 'client',
                  });
                }
              : undefined
          }
        />
      )}
      <DetailsListItem
        label={t(`details.buyer`)}
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
      <DetailsListItem
        label={t(`details.seller`)}
        data={data.seller}
        onPress={
          canNavigateTo('seller', accountType)
            ? () => {
                navigation.navigate('sellerDetails', {
                  id: data.seller?.id,
                });
              }
            : undefined
        }
      />
      <DetailsListItem
        label={data.vendors?.length === 1 ? t(`details.vendor`) : t(`details.vendors`)}
        items={data.vendors}
        onPress={() => {}}
      />
      <DetailsListItem
        label={data.products?.length === 1 ? t(`details.product`) : t(`details.products`)}
        items={data.products}
        onPress={() => {}}
      />
      {isOperations && (
        <ListItemWithLabelAndText title={t(`details.source`)} subtitle={data.source} />
      )}
      <DetailsListItem
        label={t(`details.salesQuote`)}
        data={data.salesQuote}
        subtitle={data.salesQuote?.id}
        hideImage={true}
        onPress={() => {
          navigation.navigate('salesQuoteDetails', {
            id: data.salesQuote?.id,
          });
        }}
      />
      <ListItemWithLabelAndText
        title={t(`details.operationsExternalId`)}
        subtitle={data.externalIds.operations}
      />
      {isOperations && (
        <ListItemWithLabelAndText
          title={t(`details.pp`)}
          subtitle={`${data.price.currency} ${totalPP}`}
        />
      )}
      <ListItemWithLabelAndText
        title={t(`details.sp`)}
        subtitle={`${data.price.currency} ${totalSP}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.gt`)}
        subtitle={`${data.price.currency} ${totalGT}`}
        isLast={isOperations ? false : true}
      />
      {isOperations && (
        <ListItemWithLabelAndText
          title={t(`details.yield`)}
          subtitle={`${formattedMarkup}    ${formattedMargin}`}
          isLast={true}
        />
      )}
    </CardWithHeader>
  );
};

export default SalesOrderDetailsContent;
