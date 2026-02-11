import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { BuyerData } from '@/types/admin';
import type { RootStackParamList } from '@/types/navigation';

const BuyerDetailsContent = ({ data }: { data: BuyerData }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <DetailsListItem
          label={t(`details.client`)}
          data={data.account}
          onPress={() => {
            navigation.navigate('accountDetails', {
              id: data.account?.id,
              type: 'client',
            });
          }}
        />

        <ListItemWithLabelAndText
          title={t(`details.scuIdentifier`)}
          subtitle={data.externalIds?.erpCustomer}
        />
        <ListItemWithLabelAndText
          title={t(`details.taxNumber`)}
          subtitle={data.taxId}
          isLast={true}
        />
      </CardWithHeader>
      <CardWithHeader title={t(`details.address`)}>
        <ListItemWithLabelAndText
          title={t(`details.addressLine1`)}
          subtitle={data?.address?.addressLine1}
        />
        <ListItemWithLabelAndText
          title={t(`details.addressLine2`)}
          subtitle={data?.address?.addressLine2}
        />
        <ListItemWithLabelAndText title={t(`details.city`)} subtitle={data?.address?.city} />
        <ListItemWithLabelAndText title={t(`details.state`)} subtitle={data?.address?.state} />
        <ListItemWithLabelAndText
          title={t(`details.postCode`)}
          subtitle={data?.address?.postCode}
        />
        <ListItemWithLabelAndText
          title={t(`details.country`)}
          subtitle={
            data?.address?.country ? t(`common.countries.${data?.address?.country}`) : undefined
          }
          isLast={true}
        />
      </CardWithHeader>
    </>
  );
};

export default BuyerDetailsContent;
