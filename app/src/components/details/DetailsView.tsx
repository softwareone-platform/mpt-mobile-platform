import { View, Text } from 'react-native';

import type { CreditMemoDetails } from '@/types/billing';

interface DetailsViewProps {
  data: CreditMemoDetails;
}

const DetailsView = ({ data }: DetailsViewProps) => {
  return (
    <View>
      {/* TODO: map all the fields and output them propertly */}
      <Text>ID: {data.id}</Text>
    </View>
  );
};

export default DetailsView;
