import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import type { OrderDetails } from '@/types/order';
import { formatPercentage } from '@/utils/formatting';
import { calculateMarginWithMarkup } from '@/utils/formulas';
import { canNavigateTo } from '@/utils/navigationPermissions';

const OrderDetailsContent = ({ data }: { data: OrderDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type as AccountType | undefined;

  const labelUp = t('details.up');
  const labelDown = t('details.down');
  const labelResaleLicensee = data.licensee?.eligibility?.partner
    ? t(`details.yes`)
    : t(`details.no`);

  const formattedAverageMarkup = `${formatPercentage(data.price.markup, 2) || EMPTY_VALUE} ${labelUp}`;
  const formattedAverageMargin = `${formatPercentage(data.price.margin, 2) || EMPTY_VALUE} ${labelDown}`;
  const formattedDefaultMarkup = `${formatPercentage(data.price.defaultMarkup, 2) || EMPTY_VALUE} ${labelUp}`;
  const defaultMargin = calculateMarginWithMarkup(data.price.defaultMarkup || 0);
  const formattedDefaultMargin = `${formatPercentage(defaultMargin, 2) || EMPTY_VALUE} ${labelDown}`;

  return (
    <CardWithHeader title={t(`details.title`)}>
      <ListItemWithLabelAndText title={t(`details.type`)} subtitle={data.type} />
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
        label={t(`details.product`)}
        data={data.product}
        onPress={() => {
          navigation.navigate('productDetails', {
            id: data.product?.id,
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
      <ListItemWithLabelAndText
        title={t(`details.resaleLicensee`)}
        subtitle={data.licensee?.eligibility?.partner === undefined ? '' : labelResaleLicensee}
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
