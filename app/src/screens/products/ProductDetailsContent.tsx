import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import CardWithHeader from '@/components/card/CardWithHeader';
import DetailsListItem from '@/components/list-item/DetailsListItem';
import ListItemWithLabelAndText from '@/components/list-item/ListItemWithLabelAndText';
import { EMPTY_VALUE } from '@/constants/common';
import { useAccountType } from '@/hooks/useAccountType';
import { cardStyle } from '@/styles/components';
import type { ProductData } from '@/types/admin';
import type { RootStackParamList } from '@/types/navigation';

const ProductDetailsContent = ({ data }: { data: ProductData }) => {
  const { t } = useTranslation();
  const { isOperations, isVendor } = useAccountType();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
        <View style={cardStyle.body}>
          <Text style={cardStyle.bodyText} selectable>
            {data.shortDescription || EMPTY_VALUE}
          </Text>
        </View>
      </CardWithHeader>
    </>
  );
};

export default ProductDetailsContent;
