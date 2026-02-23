import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccount } from '@/context/AccountContext';
import type { BuyerData } from '@/types/admin';
import type { RootStackParamList } from '@/types/navigation';
import { canNavigateTo } from '@/utils/navigationPermissions';

const BuyerDetailsContent = ({ data }: { data: BuyerData }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type;

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <DetailsListItem
          label={t(`details.account`)}
          data={data.account}
          onPress={
            canNavigateTo('clientAccount', accountType)
              ? () => {
                  navigation.navigate('accountDetails', {
                    id: data.account?.id,
                    type: 'client',
                  });
                }
              : undefined
          }
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
      <AddressCard address={data.address} headerTitle={t(`details.address`)} />
    </>
  );
};

export default BuyerDetailsContent;
