import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import CommonBillingDetailsSection from '../billing/CommonBillingDetailsSection';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { useAccount } from '@/context/AccountContext';
import type { JournalDetails } from '@/types/billing';
import type { AccountType } from '@/types/common';
import type { RootStackParamList } from '@/types/navigation';
import { canNavigateTo } from '@/utils/navigationPermissions';

const JournalDetailsContent = ({ data }: { data: JournalDetails }) => {
  const { t } = useTranslation();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { userData } = useAccount();
  const accountType = userData?.currentAccount?.type as AccountType | undefined;

  return (
    <CardWithHeader title={t(`details.title`)}>
      <CommonBillingDetailsSection data={data} />

      <DetailsListItem
        label={t(`details.owner`)}
        data={data.ledger?.owner}
        onPress={
          canNavigateTo('seller', accountType)
            ? () => {
                navigation.navigate('sellerDetails', {
                  id: data.ledger?.owner?.id,
                });
              }
            : undefined
        }
      />
      <ListItemWithLabelAndText
        title={t(`details.source`)}
        subtitle={data.ledger?.id}
        isLast={true}
      />
    </CardWithHeader>
  );
};

export default JournalDetailsContent;
