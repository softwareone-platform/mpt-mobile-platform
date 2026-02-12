import { AccountType } from '@/types/common';
import { NavigationMapper } from '@/types/navigation';
import { hasModuleAccess } from '@/utils/moduleClaims';

export function canShowNavItem(
  accessToken: string | null,
  accountType: AccountType | null,
  navItemId: string,
  mapper: NavigationMapper,
): boolean {
  if (!accessToken) return false;

  const permission = mapper[navItemId];
  if (!permission) return true;

  if (permission.roles && permission.roles.length > 0) {
    if (!accountType || !permission.roles.includes(accountType)) {
      return false;
    }
  }

  if (permission.modules && permission.modules.length > 0) {
    const hasAccess = permission.modules.some((module) => hasModuleAccess(accessToken, module));

    if (!hasAccess) {
      return false;
    }
  }
  return true;
}

export function filterNavItems(
  accessToken: string | null,
  accountType: AccountType | null,
  navItems: string[],
  mapper: NavigationMapper,
): string[] {
  return navItems.filter((navItemId) =>
    canShowNavItem(accessToken, accountType, navItemId, mapper),
  );
}
