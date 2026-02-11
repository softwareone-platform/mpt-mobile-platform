import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { SellerData } from '@/types/admin';

const SellerDetailsContent = ({ data }: { data: SellerData }) => {
  const { t } = useTranslation();

  return (
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
      <ListItemWithLabelAndText title={t(`details.postCode`)} subtitle={data?.address?.postCode} />
      <ListItemWithLabelAndText
        title={t(`details.country`)}
        subtitle={
          data?.address?.country ? t(`common.countries.${data?.address?.country}`) : undefined
        }
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default SellerDetailsContent;
