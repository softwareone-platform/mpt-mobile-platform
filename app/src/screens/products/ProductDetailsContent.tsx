import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccount } from '@/context/AccountContext';
import { textStyle } from '@/styles/components';
import type { ProductData } from '@/types/admin';
import type { RootStackParamList } from '@/types/navigation';

const ProductDetailsContent = ({ data }: { data: ProductData }) => {
  const { t } = useTranslation();
  const { userData } = useAccount();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const accountType = userData?.currentAccount?.type;
  const isOperations = accountType === 'Operations';
  const isVendor = accountType === 'Vendor';

  const handleVendorPress = () => {
    if (data.vendor?.id) {
      navigation.navigate('accountDetails', {
        id: data.vendor.id,
        type: 'vendor',
      });
    }
  };

  return (
    <>
      <CardWithHeader title={t(`details.title`)}>
        {!isVendor && (
          <DetailsListItem
            label={t(`details.vendor`)}
            data={data.vendor}
            onPress={isOperations ? handleVendorPress : undefined}
          />
        )}
        <ListItemWithLabelAndText title={t(`details.name`)} subtitle={data.name} />
        <ListItemWithLabelAndText
          title={t(`details.website`)}
          subtitle={data.website}
          isLast={true}
        />
      </CardWithHeader>
      <CardWithHeader title={t(`details.description`)}>
        <Text style={styles.descriptionText}>{data.shortDescription || EMPTY_VALUE}</Text>
      </CardWithHeader>
    </>
  );
};

const styles = StyleSheet.create({
  descriptionText: {
    ...textStyle.textLarge,
    padding: 16,
  },
});

export default ProductDetailsContent;
