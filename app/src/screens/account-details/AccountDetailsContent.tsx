import { useTranslation } from 'react-i18next';

import AddressCard from '@/components/address/AddressCard';
import CardWithHeader from '@/components/card/CardWithHeader';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { AccountDetails } from '@/types/api';

const AccountDetailsContent = ({ data }: { data: AccountDetails }) => {
  const { t } = useTranslation();

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
    </>
  );
};

export default AccountDetailsContent;
