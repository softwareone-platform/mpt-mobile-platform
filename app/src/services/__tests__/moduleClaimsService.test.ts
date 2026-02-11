import { jwtDecode } from 'jwt-decode';

import { moduleClaimsService } from '@/services/moduleClaimsService';
import { ModuleClaims, MODULES_CLAIMS_KEY } from '@/types/modules';

jest.mock('jwt-decode');
jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
  },
}));

describe('ModuleClaimsService', () => {
  const mockToken = 'mock.token';
  const mockClaims: ModuleClaims = {
    'access-management': ['edit'],
    billing: ['read'],
    'new-marketplace': ['edit'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract module claims', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      [MODULES_CLAIMS_KEY]: mockClaims,
    });

    const result = moduleClaimsService.getModuleClaims(mockToken);
    expect(result).toEqual(mockClaims);
  });

  it('should return null when no claims or error', () => {
    (jwtDecode as jest.Mock).mockReturnValue({});
    expect(moduleClaimsService.getModuleClaims(mockToken)).toBeNull();

    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid');
    });
    expect(moduleClaimsService.getModuleClaims(mockToken)).toBeNull();
  });

  it('should check module access', () => {
    (jwtDecode as jest.Mock).mockReturnValue({
      [MODULES_CLAIMS_KEY]: mockClaims,
    });

    expect(moduleClaimsService.hasModuleAccess(mockToken, 'billing')).toBe(true);
    expect(moduleClaimsService.hasModuleAccess(mockToken, 'catalog-management')).toBe(false);
  });
});
