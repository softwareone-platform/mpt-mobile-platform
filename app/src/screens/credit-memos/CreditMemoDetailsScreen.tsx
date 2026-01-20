import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';

import DetailsHeader from '@/components/details/DetailsHeader';
import DetailsView from '@/components/details/DetailsView';
import type { ListItemWithStatusProps } from '@/types/lists';
import type { TabParamList } from '@/types/navigation';

type CreditMemoDetailsRouteProp = RouteProp<TabParamList, 'creditMemoDetails'>;

const CreditMemoDetailsScreen = () => {
  const { params } = useRoute<CreditMemoDetailsRouteProp>();

  const headerData: ListItemWithStatusProps = params.headerProps;

  return (
    <View>
      <DetailsHeader
        id={headerData.id}
        title={headerData.title}
        subtitle={headerData.subtitle}
        imagePath={headerData.imagePath}
        statusText={headerData.statusText}
        testID="credit-memo-details-header"
      />
      <DetailsView />
    </View>
  );
};

export default CreditMemoDetailsScreen;
