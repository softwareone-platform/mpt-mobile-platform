import { moduleClaimsService } from '@/services/moduleClaimsService';
import { AccountType } from '@/types/common';
import { NavigationMapper } from '@/types/navigation-permissions';

class NavigationPermissionService {
  canShowNavItem(
    accessToken: string | null,
    accountType: AccountType | null,
    navItemId: string,
    mapper: NavigationMapper,
  ): boolean {
    console.info(`[NavigationPermissionService] Checking nav item: "${navItemId}"`);

    if (!accessToken) return false;

    const permission = mapper[navItemId];
    if (!permission) return true;

    if (permission.roles && permission.roles.length > 0) {
      if (!accountType || !permission.roles.includes(accountType)) {
        return false;
      }
    }

    if (permission.modules && permission.modules.length > 0) {
      const hasModuleAccess = permission.modules.some((module) =>
        moduleClaimsService.hasModuleAccess(accessToken, module),
      );

      if (!hasModuleAccess) {
        return false;
      }
    }
    return true;
  }

  filterNavItems(
    accessToken: string | null,
    accountType: AccountType | null,
    navItems: string[],
    mapper: NavigationMapper,
  ): string[] {
    return navItems.filter((navItemId) =>
      this.canShowNavItem(accessToken, accountType, navItemId, mapper),
    );
  }
}

export const navigationPermissionService = new NavigationPermissionService();
export default navigationPermissionService;
