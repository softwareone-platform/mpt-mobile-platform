import { renderHook } from '@testing-library/react-native';

import { useAccountType } from '@/hooks/useAccountType';

const mockUseAccount = jest.fn();

jest.mock('@/context/AccountContext', () => ({
  useAccount: () => mockUseAccount(),
}));

const makeAccount = (type: string) => ({
  userData: { currentAccount: { type } },
});

describe('useAccountType', () => {
  it('returns correct flags for Client', () => {
    mockUseAccount.mockReturnValue(makeAccount('Client'));

    const { result } = renderHook(() => useAccountType());

    expect(result.current.accountType).toBe('Client');
    expect(result.current.isClient).toBe(true);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isOperations).toBe(false);
  });

  it('returns correct flags for Vendor', () => {
    mockUseAccount.mockReturnValue(makeAccount('Vendor'));

    const { result } = renderHook(() => useAccountType());

    expect(result.current.accountType).toBe('Vendor');
    expect(result.current.isClient).toBe(false);
    expect(result.current.isVendor).toBe(true);
    expect(result.current.isOperations).toBe(false);
  });

  it('returns correct flags for Operations', () => {
    mockUseAccount.mockReturnValue(makeAccount('Operations'));

    const { result } = renderHook(() => useAccountType());

    expect(result.current.accountType).toBe('Operations');
    expect(result.current.isClient).toBe(false);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isOperations).toBe(true);
  });

  it('returns undefined accountType and all false flags when account is not set', () => {
    mockUseAccount.mockReturnValue({ userData: null });

    const { result } = renderHook(() => useAccountType());

    expect(result.current.accountType).toBeUndefined();
    expect(result.current.isClient).toBe(false);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isOperations).toBe(false);
  });
});
