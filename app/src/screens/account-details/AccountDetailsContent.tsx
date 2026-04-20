import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import CardWithHeader from '@/components/card/CardWithHeader';
import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import NavigationItem from '@/components/navigation-item/NavigationItem';
import { getAccountSubList } from '@/config/subListsNavigation';
import { useAccountType } from '@/hooks/useAccountType';
import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { AccountDetails } from '@/types/api';
import type { AccountType } from '@/types/common';

const AccountDetailsContent = ({ data }: { data: AccountDetails }) => {
  const { t } = useTranslation();
  const { navigateToSubListItem } = useSubListNavigation();
  const { accountType } = useAccountType();
  const screenAccountType = data.type;

  const filteredSubList = getAccountSubList(data.id).filter(
    (item) =>
      item.roles.includes(accountType as AccountType) &&
      item.roles.includes(screenAccountType as AccountType),
  );

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <ListItemWithLabelAndText title={t(`details.serviceLevel`)} subtitle={data?.serviceLevel} />
        <ListItemWithLabelAndText title={t(`details.companyWebsite`)} subtitle={data?.website} />
        <ListItemWithLabelAndText
          title={t(`details.companyDescription`)}
          subtitle={data?.description}
        />
        <ListItemWithLabelAndText
          title={t(`details.technicalSupportEmail`)}
          subtitle={data?.technicalSupportEmail}
        />
        <ListItemWithLabelAndText
          title={t(`details.pycId`)}
          subtitle={data?.externalIds?.pyraTenantId}
          isLast={true}
        />
      </CardWithHeader>
      <AddressCard address={data?.address} headerTitle={t(`details.headquartersAddress`)} />
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

export default AccountDetailsContent;
