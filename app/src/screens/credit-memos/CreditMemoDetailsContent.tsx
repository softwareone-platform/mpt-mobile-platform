import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { CreditMemoDetails } from '@/types/billing';
import type { RootStackParamList } from '@/types/navigation';

const CreditMemoDetailsContent = ({ data }: { data: CreditMemoDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <CardWithHeader title={t(`details.title`)}>
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
      <DetailsListItem
        label={t(`details.buyer`)}
        data={data.buyer}
        onPress={() => {
          navigation.navigate('buyerDetails', {
            id: data.buyer?.id,
          });
        }}
      />
      <DetailsListItem label={t(`details.licensee`)} data={data.licensee} />
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
      <DetailsListItem label={t(`details.agreement`)} data={data.agreement} hideImage={true} />
      <DetailsListItem
        label={t(`details.seller`)}
        data={data.seller}
        onPress={() => {
          navigation.navigate('sellerDetails', {
            id: data.seller?.id,
          });
        }}
      />
      <ListItemWithLabelAndText title={t(`details.currency`)} subtitle={data.price.currency} />
      <ListItemWithLabelAndText title={t(`details.documentId`)} subtitle={data.documentNo} />
      <ListItemWithLabelAndText
        title={t(`details.sp`)}
        subtitle={`${data.price.currency} ${data.price.totalSP?.toFixed(2) || EMPTY_VALUE}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.gt`)}
        subtitle={`${data.price.currency} ${data.price.totalGT?.toFixed(2) || EMPTY_VALUE}`}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default CreditMemoDetailsContent;
