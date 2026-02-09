import { useTranslation } from 'react-i18next';

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
      <CardWithHeader title={t(`details.headquartersAddress`)}>
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

export default AccountDetailsContent;
