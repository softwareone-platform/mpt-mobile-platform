import { jwtDecode } from 'jwt-decode';

import { MODULES_CLAIMS_KEY, ACCOUNT_TYPE_CLAIM_KEY } from '@/constants/auth';
import { ModuleClaims } from '@/types/modules';
import { getModuleClaims, hasModuleAccess, getAccountType } from '@/utils/moduleClaims';

jest.mock('jwt-decode');
jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
  },
}));

describe('Module Claims Utils', () => {
  const mockToken = 'mock.token';
  const mockClaims: ModuleClaims = {
    'access-management': ['edit'],
    billing: ['read'],
    'new-marketplace': ['edit'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getModuleClaims', () => {
    it('should extract module claims', () => {
      (jwtDecode as jest.Mock).mockReturnValue({
        [MODULES_CLAIMS_KEY]: mockClaims,
      });

      const result = getModuleClaims(mockToken);
      expect(result).toEqual(mockClaims);
    });

    it('should return null when no claims or error', () => {
      (jwtDecode as jest.Mock).mockReturnValue({});
      expect(getModuleClaims(mockToken)).toBeNull();

      (jwtDecode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });
      expect(getModuleClaims(mockToken)).toBeNull();
    });
  });

  describe('hasModuleAccess', () => {
    it('should check module access', () => {
      (jwtDecode as jest.Mock).mockReturnValue({
        [MODULES_CLAIMS_KEY]: mockClaims,
      });

      expect(hasModuleAccess(mockToken, 'billing')).toBe(true);
      expect(hasModuleAccess(mockToken, 'catalog-management')).toBe(false);
    });
  });

  describe('getAccountType', () => {
    it('should extract account type from token', () => {
      (jwtDecode as jest.Mock).mockReturnValue({
        [ACCOUNT_TYPE_CLAIM_KEY]: 'Client',
      });

      const result = getAccountType(mockToken);
      expect(result).toBe('Client');
    });

    it('should return null when no account type in token', () => {
      (jwtDecode as jest.Mock).mockReturnValue({});

      const result = getAccountType(mockToken);
      expect(result).toBeNull();
    });

    it('should return null when decode fails', () => {
      (jwtDecode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = getAccountType(mockToken);
      expect(result).toBeNull();
    });
  });
});
