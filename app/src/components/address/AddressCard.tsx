import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import type { Address } from '@/types/api';

interface Props {
  address: Address | undefined;
  headerTitle: string;
}

const AddressCard = ({ address, headerTitle }: Props) => {
  const { t } = useTranslation();

  return (
    <CardWithHeader title={headerTitle}>
      <ListItemWithLabelAndText
        title={t(`details.addressLine1`)}
        subtitle={address?.addressLine1}
      />
      <ListItemWithLabelAndText
        title={t(`details.addressLine2`)}
        subtitle={address?.addressLine2}
      />
      <ListItemWithLabelAndText title={t(`details.city`)} subtitle={address?.city} />
      <ListItemWithLabelAndText title={t(`details.state`)} subtitle={address?.state} />
      <ListItemWithLabelAndText title={t(`details.postCode`)} subtitle={address?.postCode} />
      <ListItemWithLabelAndText
        title={t(`details.country`)}
        subtitle={address?.country ? t(`common.countries.${address?.country}`) : undefined}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default AddressCard;
