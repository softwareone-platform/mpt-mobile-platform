import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import type { InvoiceDetails } from '@/types/billing';
import type { RootStackParamList } from '@/types/navigation';
import { formatDateForLocale, formatNumber } from '@/utils/formatting';

const InvoiceDetailsContent = ({ data }: { data: InvoiceDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const totalSP = formatNumber(data.price.totalSP, 2, language) || EMPTY_VALUE;
  const totalGT = formatNumber(data.price.totalGT, 2, language) || EMPTY_VALUE;
  const dueDate = formatDateForLocale(data.attributes?.dueDate, language);

  return (
    <CardWithHeader title={t(`details.title`)}>
      <DetailsListItem
        label={t(`details.client`)}
        data={data.client}
        onPress={() => {
          navigation.navigate('accountDetails', {
            id: data.client?.id,
            type: 'client',
          });
        }}
      />
      <DetailsListItem
        label={t(`details.buyer`)}
        data={data.buyer}
        onPress={() => {
          navigation.navigate('buyerDetails', {
            id: data.buyer?.id,
          });
        }}
      />
      <DetailsListItem label={t(`details.licensee`)} data={data.licensee} />
      <DetailsListItem
        label={t(`details.vendor`)}
        data={data.vendor}
        onPress={() => {
          navigation.navigate('accountDetails', {
            id: data.vendor?.id,
            type: 'vendor',
          });
        }}
      />
      <DetailsListItem label={t(`details.product`)} data={data.product} />
      <DetailsListItem label={t(`details.agreement`)} data={data.agreement} hideImage={true} />
      <DetailsListItem
        label={t(`details.seller`)}
        data={data.seller}
        onPress={() => {
          navigation.navigate('sellerDetails', {
            id: data.seller?.id,
          });
        }}
      />
      <ListItemWithLabelAndText title={t(`details.currency`)} subtitle={data.price.currency} />
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
