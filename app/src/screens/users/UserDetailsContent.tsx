import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { UserData, SsoStatus } from '@/types/api';
import { formatPhoneNumber } from '@/utils/formatting';

const UserDetailsContent = ({ data, sso }: { data: UserData; sso: SsoStatus }) => {
  const { t } = useTranslation();

  const ssoStatus = sso?.status === 'enabled' ? t('details.yes') : t('details.no');

  return (
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
  );
};

export default UserDetailsContent;
