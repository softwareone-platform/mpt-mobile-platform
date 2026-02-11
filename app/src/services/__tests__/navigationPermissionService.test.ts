import { moduleClaimsService } from '@/services/moduleClaimsService';
import { navigationPermissionService } from '@/services/navigationPermissionService';
import { NavigationMapper } from '@/types/navigation-permissions';

jest.mock('@/services/moduleClaimsService', () => ({
  moduleClaimsService: {
    hasModuleAccess: jest.fn(),
  },
}));

describe('NavigationPermissionService', () => {
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
      expect(navigationPermissionService.canShowNavItem(null, 'Client', 'home', mockMapper)).toBe(
        false,
      );
    });

    it('should return true when no permission defined', () => {
      expect(
        navigationPermissionService.canShowNavItem(mockToken, 'Client', 'unknown', mockMapper),
      ).toBe(true);
    });

    it('should return false when role not allowed', () => {
      expect(
        navigationPermissionService.canShowNavItem(mockToken, 'Operations', 'billing', mockMapper),
      ).toBe(false);
    });

    it('should return false when account type is null and roles required', () => {
      expect(
        navigationPermissionService.canShowNavItem(mockToken, null, 'billing', mockMapper),
      ).toBe(false);
    });

    it('should return false when module access denied', () => {
      (moduleClaimsService.hasModuleAccess as jest.Mock).mockReturnValue(false);

      expect(
        navigationPermissionService.canShowNavItem(mockToken, 'Client', 'billing', mockMapper),
      ).toBe(false);
    });

    it('should return true when role and module access granted', () => {
      (moduleClaimsService.hasModuleAccess as jest.Mock).mockReturnValue(true);

      expect(
        navigationPermissionService.canShowNavItem(mockToken, 'Client', 'billing', mockMapper),
      ).toBe(true);
    });

    it('should return true when only module access is required', () => {
      (moduleClaimsService.hasModuleAccess as jest.Mock).mockReturnValue(true);

      expect(
        navigationPermissionService.canShowNavItem(mockToken, 'Operations', 'users', mockMapper),
      ).toBe(true);
    });

    it('should check any of multiple modules', () => {
      const mapperWithMultiple: NavigationMapper = {
        dashboard: { modules: ['billing', 'new-marketplace'] },
      };

      (moduleClaimsService.hasModuleAccess as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      expect(
        navigationPermissionService.canShowNavItem(
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
      (moduleClaimsService.hasModuleAccess as jest.Mock).mockImplementation(
        (token: string, module: string) => {
          return module === 'new-marketplace' || module === 'access-management';
        },
      );

      const navItems = ['home', 'orders', 'billing', 'users'];
      const result = navigationPermissionService.filterNavItems(
        mockToken,
        'Client',
        navItems,
        mockMapper,
      );

      expect(result).toEqual(['home', 'orders', 'users']);
    });

    it('should return empty array when no token', () => {
      const result = navigationPermissionService.filterNavItems(
        null,
        'Client',
        ['home', 'orders'],
        mockMapper,
      );

      expect(result).toEqual([]);
    });

    it('should filter based on account type', () => {
      (moduleClaimsService.hasModuleAccess as jest.Mock).mockReturnValue(true);

      const result = navigationPermissionService.filterNavItems(
        mockToken,
        'Operations',
        ['orders', 'billing'],
        mockMapper,
      );

      expect(result).toEqual([]);
    });
  });
});
