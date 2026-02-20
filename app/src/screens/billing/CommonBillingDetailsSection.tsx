import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import DetailsListItem from '@/components/list-item/DetailsListItem';
import type { CommonBillingDetails } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';

const CommonBillingDetailsSection = ({ data }: { data: CommonBillingDetails }) => {
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
      <DetailsListItem
        label={t(`details.licensee`)}
        data={data.licensee}
        onPress={() => {
          navigation.navigate('licenseeDetails', {
            id: data.licensee?.id,
          });
        }}
      />
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
        label={t(`details.product`)}
        data={data.product}
        onPress={() => {
          navigation.navigate('productDetails', {
            id: data.product?.id,
          });
        }}
      />
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
        label={t(`details.seller`)}
        data={data.seller}
        onPress={() => {
          navigation.navigate('sellerDetails', {
            id: data.seller?.id,
          });
        }}
      />
    </>
  );
};

export default CommonBillingDetailsSection;
