import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { RootStackParamList } from '@/types/navigation';
import type { OrderDetails } from '@/types/order';
import { formatPercentage } from '@/utils/formatting';
import { calculateMarginWithMarkup } from '@/utils/formulas';

const OrderDetailsContent = ({ data }: { data: OrderDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const formattedAverageMarkup = formatPercentage(data.price.markup, 2) + ` ${t(`details.up`)}`;
  const formattedAverageMargin = formatPercentage(data.price.margin, 2) + ` ${t(`details.down`)}`;
  const formattedDefaultMarkup =
    formatPercentage(data.price.defaultMarkup, 2) + ` ${t(`details.up`)}`;
  const defaultMargin = calculateMarginWithMarkup(data.price.defaultMarkup || 0);
  const formattedDefaultMargin = formatPercentage(defaultMargin, 2) + ` ${t(`details.down`)}`;

  return (
    <CardWithHeader title={t(`details.title`)}>
      <ListItemWithLabelAndText title={t(`details.type`)} subtitle={data.type} />
      <DetailsListItem label={t(`details.agreement`)} data={data.agreement} hideImage={true} />
      <DetailsListItem label={t(`details.product`)} data={data.product} />
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
      <ListItemWithLabelAndText
        title={t(`details.resaleLicencee`)}
        subtitle={
          data.licencee?.eligibility?.partner === undefined
            ? '-'
            : data.licencee?.eligibility?.partner
              ? t(`details.yes`)
              : t(`details.no`)
        }
      />
      <ListItemWithLabelAndText
        title={t(`details.averageYield`)}
        subtitle={`${formattedAverageMarkup}    ${formattedAverageMargin}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.defaultYield`)}
        subtitle={`${formattedDefaultMarkup}    ${formattedDefaultMargin}`}
      />

      <ListItemWithLabelAndText title={t(`details.currency`)} subtitle={data.price.currency} />
      <DetailsListItem label={t(`details.assignee`)} data={data.assignee} isLast={true} />
    </CardWithHeader>
  );
};

export default OrderDetailsContent;
