import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

import type { RootStackParamList, SubListItem } from '@/types/navigation';

export const useSubListNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const navigateToSubListItem = useCallback(
    (item: SubListItem) => {
      if (item.name === 'subscriptions') {
        navigation.navigate('subscriptions', {
          screen: 'subscriptionsRoot',
          params: { query: item.query },
        });
      } else {
        navigation.navigate(item.name, {
          query: item.query,
        });
      }
    },
    [navigation],
  );

  return { navigateToSubListItem };
};
