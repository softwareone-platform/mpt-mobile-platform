import { renderHook } from '@testing-library/react-native';

import { useAuth } from '@/context/AuthContext';
import { useFilteredNavigation } from '@/hooks/useFilteredNavigation';
import { hasModuleAccess } from '@/utils/moduleClaims';

// Mock dependencies
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/moduleClaims', () => ({
  hasModuleAccess: jest.fn(),
}));

describe('useFilteredNavigation', () => {
  const mockItems = [
    { name: 'home', component: jest.fn(), modules: ['new-marketplace'] },
    { name: 'orders', component: jest.fn(), modules: ['new-marketplace'], roles: ['Client'] },
    { name: 'billing', component: jest.fn(), modules: ['billing'], roles: ['Client'] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all items when no access token', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: null,
      accountType: null,
    });

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toEqual(mockItems);
    expect(hasModuleAccess).not.toHaveBeenCalled();
  });

  it('should filter items based on permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    (hasModuleAccess as jest.Mock).mockImplementation((_token, module) => {
      return module === 'new-marketplace';
    });

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].name).toBe('home');
    expect(result.current[1].name).toBe('orders');
  });

  it('should return empty array when no items match permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    (hasModuleAccess as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toEqual([]);
  });

  it('should filter by role when user does not have required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Operations',
    });

    (hasModuleAccess as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('home');
  });

  it('should handle items without permissions', () => {
    const itemsWithoutPerms = [{ name: 'public', component: jest.fn() }];

    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    const { result } = renderHook(() => useFilteredNavigation(itemsWithoutPerms));

    expect(result.current).toEqual(itemsWithoutPerms);
  });
});
