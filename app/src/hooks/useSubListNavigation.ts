import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

import type { RootStackParamList, SubListItem } from '@/types/navigation';

export const useSubListNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const navigateToSubListItem = useCallback(
    (item: SubListItem) => {
      navigation.navigate(item.name, {
        query: item.query,
        accountId: item.accountId,
        source: item.source,
      });
    },
    [navigation],
  );

  return { navigateToSubListItem };
};
