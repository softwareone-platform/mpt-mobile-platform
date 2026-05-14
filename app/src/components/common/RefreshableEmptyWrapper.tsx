import { ScrollView } from 'react-native';

import RefreshControl from '@/components/common/RefreshControl';
import { screenStyle } from '@/styles/components';

type Props = {
  onRefresh: () => void;
  isRefreshing: boolean;
  children: React.ReactNode;
};

const RefreshableEmptyWrapper = ({ onRefresh, isRefreshing, children }: Props) => (
  <ScrollView
    style={screenStyle.containerFlex}
    contentContainerStyle={screenStyle.contentCenterFillContainer}
    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
  >
    {children}
  </ScrollView>
);

export default RefreshableEmptyWrapper;
