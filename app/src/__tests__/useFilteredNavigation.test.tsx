import { renderHook } from '@testing-library/react-native';

import { useAuth } from '@/context/AuthContext';
import { useFilteredNavigation } from '@/hooks/useFilteredNavigation';
import { canShowNavItem } from '@/utils/navigationPermissions';

// Mock dependencies
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/utils/navigationPermissions', () => ({
  canShowNavItem: jest.fn(),
}));

jest.mock('@/config/navigation-mapper.json', () => ({}));

describe('useFilteredNavigation', () => {
  const mockItems = [
    { name: 'home', component: jest.fn() },
    { name: 'orders', component: jest.fn() },
    { name: 'billing', component: jest.fn() },
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
    expect(canShowNavItem).not.toHaveBeenCalled();
  });

  it('should filter items based on permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    (canShowNavItem as jest.Mock).mockImplementation((_token, _accountType, navItemId) => {
      return navItemId === 'home' || navItemId === 'orders';
    });

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].name).toBe('home');
    expect(result.current[1].name).toBe('orders');
    expect(canShowNavItem).toHaveBeenCalledTimes(3);
  });

  it('should return empty array when no items match permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    (canShowNavItem as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toEqual([]);
  });

  it('should return all items when all match permissions', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: 'Client',
    });

    (canShowNavItem as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toEqual(mockItems);
  });

  it('should handle accountType being null', () => {
    (useAuth as jest.Mock).mockReturnValue({
      tokens: { accessToken: 'mock.token' },
      accountType: null,
    });

    (canShowNavItem as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useFilteredNavigation(mockItems));

    expect(result.current).toEqual(mockItems);
    expect(canShowNavItem).toHaveBeenCalledWith(
      'mock.token',
      null,
      expect.any(String),
      expect.any(Object),
    );
  });
});
