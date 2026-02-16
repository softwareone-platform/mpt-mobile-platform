import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { CreditMemoDetails, InvoiceDetails } from '@/types/billing';
import type { RootStackParamList } from '@/types/navigation';

const CommonBillingDetailsSection = ({ data }: { data: CreditMemoDetails | InvoiceDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <>
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
    </>
  );
};

export default CommonBillingDetailsSection;
