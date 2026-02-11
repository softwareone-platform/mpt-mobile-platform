import { useMemo } from 'react';

import navigationMapperJson from '@/config/navigation-mapper.json';
import { useAuth } from '@/context/AuthContext';
import { navigationPermissionService } from '@/services/navigationPermissionService';
import { NavigationMapper } from '@/types/navigation-permissions';

const navigationMapper = navigationMapperJson as unknown as NavigationMapper;

export function useFilteredNavigation<T extends { name: string }>(items: T[]): T[] {
  const { tokens, accountType } = useAuth();

  const filteredItems = useMemo(() => {
    if (!tokens?.accessToken) return items;

    return items.filter((item) =>
      navigationPermissionService.canShowNavItem(
        tokens.accessToken,
        accountType,
        item.name,
        navigationMapper,
      ),
    );
  }, [items, tokens?.accessToken, accountType]);

  return filteredItems;
}
