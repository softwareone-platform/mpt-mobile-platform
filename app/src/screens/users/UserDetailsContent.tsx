import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import NavigationGroupCard from '@/components/card/NavigationGroupCard';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import NavigationItem from '@/components/navigation-item/NavigationItem';
import { getUserSubList } from '@/config/subListsNavigation';
import { useAccountType } from '@/hooks/useAccountType';
import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { UserData, SsoStatus } from '@/types/api';
import type { AccountType } from '@/types/common';
import { formatPhoneNumber } from '@/utils/formatting';

const UserDetailsContent = ({
  data,
  sso,
  showAccounts = false,
}: {
  data: UserData;
  sso: SsoStatus;
  showAccounts?: boolean;
}) => {
  const { t } = useTranslation();
  const { navigateToSubListItem } = useSubListNavigation();
  const { accountType } = useAccountType();
  const ssoStatus = sso?.status === 'enabled' ? t('details.yes') : t('details.no');

  const filteredSubList = showAccounts
    ? getUserSubList(data.id).filter((item) => item.roles.includes(accountType as AccountType))
    : [];

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <ListItemWithLabelAndText title={t('details.email')} subtitle={data.email} />
        <ListItemWithLabelAndText title={t('details.singleSignOn')} subtitle={ssoStatus} />
        <ListItemWithLabelAndText title={t('details.firstName')} subtitle={data.firstName} />
        <ListItemWithLabelAndText title={t('details.lastName')} subtitle={data.lastName} />
        <ListItemWithLabelAndText
          title={t('details.phoneNumber')}
          subtitle={formatPhoneNumber(data.phone?.prefix, data.phone?.number)}
          isLast={true}
        />
      </CardWithHeader>
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

export default UserDetailsContent;
