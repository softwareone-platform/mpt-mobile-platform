import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import CardWithHeader from '@/components/card/CardWithHeader';
import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import NavigationItem from '@/components/navigation-item/NavigationItem';
import { getBuyerSubList } from '@/config/subListsNavigation';
import { useAccountType } from '@/hooks/useAccountType';
import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { BuyerData } from '@/types/admin';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import { canNavigateTo } from '@/utils/navigationPermissions';

const BuyerDetailsContent = ({ data }: { data: BuyerData }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { accountType } = useAccountType();
  const { navigateToSubListItem } = useSubListNavigation();

  const filteredSubList = getBuyerSubList(data.id).filter((item) =>
    item.roles.includes(accountType as AccountType),
  );

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
      {filteredSubList.length > 0 && (
        <NavigationGroupCard>
          {filteredSubList.map((item, index) => (
            <NavigationItem
              key={item.name}
              title={t(`navigation.tabs.${item.name}`)}
              isLast={index === filteredSubList.length - 1}
              onPress={() => {
                navigateToSubListItem(item);
              }}
            />
          ))}
        </NavigationGroupCard>
      )}
    </>
  );
};

export default BuyerDetailsContent;
