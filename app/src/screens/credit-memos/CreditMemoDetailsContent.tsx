import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { CreditMemoDetails } from '@/types/billing';
import type { TabParamList } from '@/types/navigation';

const CreditMemoDetailsContent = ({ data }: { data: CreditMemoDetails }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<TabParamList>>();

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.client`)}
        data={data.client}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.buyer`)}
        data={data.buyer}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.licencee`)}
        data={data.licencee}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.vendor`)}
        data={data.vendor}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.product`)}
        data={data.product}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.agreement`)}
        data={data.agreement}
        hideImage={true}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <DetailsListItem
        label={t(`details.seller`)}
        data={data.seller}
        onPress={() => {
          navigation.navigate('agreements');
        }}
      />
      <ListItemWithLabelAndText title={t(`details.currency`)} subtitle={data.price.currency} />
      <ListItemWithLabelAndText title={t(`details.documentId`)} subtitle={data.documentNo} />
      <ListItemWithLabelAndText
        title={t(`details.sp`)}
        subtitle={`${data.price.currency} ${data.price.totalSP.toFixed(2)}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.gt`)}
        subtitle={`${data.price.currency} ${data.price.totalGT.toFixed(2)}`}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default CreditMemoDetailsContent;
