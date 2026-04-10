import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import type { RootStackParamList, SubListItem } from '@/types/navigation';

export const useSubListNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const navigateToSubListItem = (item: SubListItem, query: string) => {
    if (item.name === 'subscriptions') {
      navigation.navigate('subscriptions', {
        screen: 'subscriptionsRoot',
        params: { query: query },
      });
    } else {
      navigation.navigate(item.name, {
        query: query,
      });
    }
  };

  return { navigateToSubListItem };
};
