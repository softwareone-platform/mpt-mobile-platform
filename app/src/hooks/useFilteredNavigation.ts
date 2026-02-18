import { useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import type { ModuleName } from '@/types/modules';
import { hasModuleAccess } from '@/utils/moduleClaims';

function canAccessNavItem<T extends { modules?: string[]; roles?: string[] }>(
  item: T,
  accessToken: string,
  accountType: string | null,
): boolean {
  if (!item.modules && !item.roles) return true;

  if (item.roles && item.roles.length > 0) {
    if (!accountType || !item.roles.includes(accountType)) {
      return false;
    }
  }

  if (item.modules && item.modules.length > 0) {
    const hasAccess = item.modules.some((module) =>
      hasModuleAccess(accessToken, module as ModuleName),
    );
    if (!hasAccess) {
      return false;
    }
  }

  return true;
}

export function useFilteredNavigation<
  T extends { name: string; modules?: string[]; roles?: string[] },
>(items: T[]): T[] {
  const { tokens, accountType } = useAuth();

  const filteredItems = useMemo(() => {
    if (!tokens?.accessToken) return items;
    return items.filter((item) => canAccessNavItem(item, tokens.accessToken, accountType));
  }, [items, tokens?.accessToken, accountType]);

  return filteredItems;
}
