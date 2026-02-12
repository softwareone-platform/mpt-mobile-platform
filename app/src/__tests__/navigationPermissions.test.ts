import { NavigationMapper } from '@/types/navigation';
import { canShowNavItem, filterNavItems } from '@/utils/navigationPermissions';

jest.mock('@/utils/moduleClaims', () => ({
  hasModuleAccess: jest.fn(),
}));

import { hasModuleAccess } from '@/utils/moduleClaims';

describe('Navigation Permissions Utils', () => {
  const mockToken = 'mock.token';
  const mockMapper: NavigationMapper = {
    home: { modules: ['new-marketplace'] },
    orders: { modules: ['new-marketplace'], roles: ['Client', 'Vendor'] },
    billing: { modules: ['billing'], roles: ['Client'] },
    users: { modules: ['access-management'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canShowNavItem', () => {
    it('should return false when no access token', () => {
      expect(canShowNavItem(null, 'Client', 'home', mockMapper)).toBe(false);
    });

    it('should return true when no permission defined', () => {
      expect(canShowNavItem(mockToken, 'Client', 'unknown', mockMapper)).toBe(true);
    });

    it('should return false when role not allowed', () => {
      expect(canShowNavItem(mockToken, 'Operations', 'billing', mockMapper)).toBe(false);
    });

    it('should return false when account type is null and roles required', () => {
      expect(canShowNavItem(mockToken, null, 'billing', mockMapper)).toBe(false);
    });

    it('should return false when module access denied', () => {
      (hasModuleAccess as jest.Mock).mockReturnValue(false);

      expect(
        canShowNavItem(mockToken, 'Client', 'billing', mockMapper),
      ).toBe(false);
    });

    it('should return true when role and module access granted', () => {
      (hasModuleAccess as jest.Mock).mockReturnValue(true);

      expect(
        canShowNavItem(mockToken, 'Client', 'billing', mockMapper),
      ).toBe(true);
    });

    it('should return true when only module access is required', () => {
      (hasModuleAccess as jest.Mock).mockReturnValue(true);

      expect(
        canShowNavItem(mockToken, 'Operations', 'users', mockMapper),
      ).toBe(true);
    });

    it('should check any of multiple modules', () => {
      const mapperWithMultiple: NavigationMapper = {
        dashboard: { modules: ['billing', 'new-marketplace'] },
      };

      (hasModuleAccess as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      expect(
        canShowNavItem(
          mockToken,
          'Client',
          'dashboard',
          mapperWithMultiple,
        ),
      ).toBe(true);
    });
  });

  describe('filterNavItems', () => {
    it('should filter nav items based on permissions', () => {
      (hasModuleAccess as jest.Mock).mockImplementation(
        (token: string, module: string) => {
          return module === 'new-marketplace' || module === 'access-management';
        },
      );

      const navItems = ['home', 'orders', 'billing', 'users'];
      const result = filterNavItems(
        mockToken,
        'Client',
        navItems,
        mockMapper,
      );

      expect(result).toEqual(['home', 'orders', 'users']);
    });

    it('should return empty array when no token', () => {
      const result = filterNavItems(
        null,
        'Client',
        ['home', 'orders'],
        mockMapper,
      );

      expect(result).toEqual([]);
    });

    it('should filter based on account type', () => {
      (hasModuleAccess as jest.Mock).mockReturnValue(true);

      const result = filterNavItems(
        mockToken,
        'Operations',
        ['orders', 'billing'],
        mockMapper,
      );

      expect(result).toEqual([]);
    });
  });
});
