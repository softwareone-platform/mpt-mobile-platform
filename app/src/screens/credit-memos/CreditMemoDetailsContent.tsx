import { useTranslation } from 'react-i18next';

import CommonBillingDetailsSection from '../billing/CommonBillingDetailsSection';

import CardWithHeader from '@/components/card/CardWithHeader';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { CreditMemoDetails } from '@/types/billing';

const CreditMemoDetailsContent = ({ data }: { data: CreditMemoDetails }) => {
  const { t } = useTranslation();

  return (
    <CardWithHeader title={t(`details.title`)}>
      <CommonBillingDetailsSection data={data} />

      <ListItemWithLabelAndText title={t(`details.currency`)} subtitle={data.price.currency} />
      <ListItemWithLabelAndText title={t(`details.documentId`)} subtitle={data.documentNo} />
      <ListItemWithLabelAndText
        title={t(`details.sp`)}
        subtitle={`${data.price.currency} ${data.price.totalSP?.toFixed(2) || EMPTY_VALUE}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.gt`)}
        subtitle={`${data.price.currency} ${data.price.totalGT?.toFixed(2) || EMPTY_VALUE}`}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default CreditMemoDetailsContent;
