import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CommonBillingDetailsSection from '../billing/CommonBillingDetailsSection';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import type { StatementDetails } from '@/types/billing';
import type { RootStackParamList } from '@/types/navigation';
import { formatNumber, formatPercentage, formatDateForLocale, getTime } from '@/utils/formatting';

const StatementDetailsContent = ({ data }: { data: StatementDetails }) => {
  const { t, i18n } = useTranslation();

  const language = i18n.language;

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type;

  const totalPP = formatNumber(data.price.totalPP, 2, language) || EMPTY_VALUE;
  const totalSP = formatNumber(data.price.totalSP, 2, language) || EMPTY_VALUE;
  const formattedMarkup = `${formatPercentage(data.price.markup, 2) || EMPTY_VALUE} ${t('details.up')}`;
  const formattedMargin = `${formatPercentage(data.price.margin, 2) || EMPTY_VALUE} ${t('details.down')}`;

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        <CommonBillingDetailsSection data={data} />

        <DetailsListItem
          label={t(`details.owner`)}
          data={data.ledger?.owner}
          onPress={
            accountType !== 'Vendor'
              ? () => {
                  navigation.navigate('sellerDetails', {
                    id: data.ledger?.owner?.id,
                  });
                }
              : undefined
          }
        />
        <ListItemWithLabelAndText title={t(`details.source`)} subtitle={data.ledger?.id} />
        <ListItemWithLabelAndText title={t(`details.statementType`)} subtitle={data.type} />
        <ListItemWithLabelAndText
          title={t(`details.pp`)}
          subtitle={`${data.price.currency.purchase} ${totalPP}`}
        />
        <ListItemWithLabelAndText
          title={t(`details.yield`)}
          subtitle={`${formattedMarkup}    ${formattedMargin}`}
        />
        <ListItemWithLabelAndText
          title={t(`details.sp`)}
          subtitle={`${data.price.currency.sale} ${totalSP}`}
          isLast={true}
        />
      </CardWithHeader>
      <CardWithHeader title={t(`details.timestamps`)}>
        {Object.entries(data.audit)
          .filter(([_, value]) => value?.at)
          .map(([key, value], index, arr) => {
            const isLast = index === arr.length - 1;

            const date = formatDateForLocale(value.at, language);
            const time = getTime(value.at);

            return (
              <ListItemWithLabelAndText
                key={key}
                title={t(`details.audit.${key}`)}
                subtitle={`${date} ${time}`}
                isLast={isLast}
              />
            );
          })}
      </CardWithHeader>
    </>
  );
};

export default StatementDetailsContent;
