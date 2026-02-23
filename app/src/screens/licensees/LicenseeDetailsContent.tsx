import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccount } from '@/context/AccountContext';
import type { LicenseeData } from '@/types/admin';
import type { RootStackParamList } from '@/types/navigation';

const LicenseeDetailsContent = ({ data }: { data: LicenseeData }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type;

  const labelResaleLicensee = data.eligibility?.partner ? t(`details.yes`) : t(`details.no`);

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <DetailsListItem
          label={t(`details.account`)}
          data={data.account}
          onPress={() => {
            navigation.navigate('accountDetails', {
              id: data.account?.id,
              type: 'account',
            });
          }}
        />
        <DetailsListItem
          label={t(`details.buyer`)}
          data={data.buyer}
          onPress={
            accountType !== 'Vendor'
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
            accountType !== 'Vendor'
              ? () => {
                  navigation.navigate('sellerDetails', {
                    id: data.seller?.id,
                  });
                }
              : undefined
          }
        />
        <ListItemWithLabelAndText
          title={t(`details.resaleLicensee`)}
          subtitle={data.eligibility?.partner === undefined ? '' : labelResaleLicensee}
          isLast={true}
        />
      </CardWithHeader>
      <AddressCard address={data.address} headerTitle={t(`details.address`)} />
    </>
  );
};

export default LicenseeDetailsContent;
