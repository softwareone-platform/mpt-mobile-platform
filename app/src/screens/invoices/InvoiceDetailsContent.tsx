import { useTranslation } from 'react-i18next';

import CommonBillingDetailsSection from '../billing/CommonBillingDetailsSection';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { InvoiceDetails } from '@/types/billing';
import { formatDateForLocale, formatNumber } from '@/utils/formatting';

const InvoiceDetailsContent = ({ data }: { data: InvoiceDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const totalSP = formatNumber(data.price.totalSP, 2, language) || EMPTY_VALUE;
  const totalGT = formatNumber(data.price.totalGT, 2, language) || EMPTY_VALUE;
  const dueDate = formatDateForLocale(data.attributes?.dueDate, language);

  return (
    <CardWithHeader title={t(`details.title`)}>
      <CommonBillingDetailsSection data={data} />

      <ListItemWithLabelAndText
        title={t(`details.source`)}
        subtitle={data.statement?.customLedger?.name}
      />
      <ListItemWithLabelAndText title={t(`details.documentId`)} subtitle={data.documentNo} />
      <DetailsListItem label={t(`details.statement`)} data={data.statement} hideImage={true} />
      <ListItemWithLabelAndText
        title={t(`details.sp`)}
        subtitle={`${data.price.currency} ${totalSP}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.gt`)}
        subtitle={`${data.price.currency} ${totalGT}`}
      />
      <ListItemWithLabelAndText
        title={t(`details.salesOrderId`)}
        subtitle={data.attributes?.orderNo}
      />
      <ListItemWithLabelAndText title={t(`details.dueDate`)} subtitle={dueDate} isLast={true} />
    </CardWithHeader>
  );
};

export default InvoiceDetailsContent;
