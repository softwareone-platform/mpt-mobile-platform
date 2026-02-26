import { renderHook, act } from '@testing-library/react-native';

jest.mock('@/services/loggerService', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { DEFAULT_PAGE_SIZE, DEFAULT_OFFSET, DEFAULT_SPOTLIGHT_LIMIT } from '@/constants/api';
import { useAccountApi } from '@/services/accountService';
import { logger } from '@/services/loggerService';

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockRefreshAuth = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    put: mockPut,
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    refreshAuth: mockRefreshAuth,
  }),
}));

const setup = () => renderHook(() => useAccountApi()).result.current;

describe('useAccountApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getUserData correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ id: '123' });

    let res;
    await act(async () => {
      res = await api.getUserData('123');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/123');
    expect(res).toEqual({ id: '123' });
  });

  it('calls getCurrentAccountIcon correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ currentAccount: { icon: 'icon.png' } });

    let res;
    await act(async () => {
      res = await api.getCurrentAccountIcon('999');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/999?select=currentAccount.icon');
    expect(res).toEqual({ currentAccount: { icon: 'icon.png' } });
  });

  it('calls getAllUserAccounts correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: '1' }]);

    let res;
    await act(async () => {
      res = await api.getAllUserAccounts('777');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/users/777/accounts');
    expect(res).toEqual([{ id: '1' }]);
  });

  it('calls getUserAccountsData with defaults', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getUserAccountsData('555');
    });

    const expectedUrl =
      `/v1/accounts/users/555/accounts` +
      `?select=id,name,type,icon,favorite,audit.access.at,-*` +
      `&eq(invitation.status,"Active")` +
      `&order=name` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual({ data: [] });
  });

  it('calls getUserAccountsData with explicit offset and limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ data: [] });

    let res;
    await act(async () => {
      res = await api.getUserAccountsData('555', 10, 20);
    });

    const expectedUrl =
      `/v1/accounts/users/555/accounts` +
      `?select=id,name,type,icon,favorite,audit.access.at,-*` +
      `&eq(invitation.status,"Active")` +
      `&order=name` +
      `&offset=10` +
      `&limit=20`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual({ data: [] });
  });

  it('calls getSpotlightData with DEFAULT_SPOTLIGHT_LIMIT', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ top: [] });

    let res;
    await act(async () => {
      res = await api.getSpotlightData(); // uses 100
    });

    expect(mockGet).toHaveBeenCalledWith(
      `/v1/spotlight/objects?select=top&limit=${DEFAULT_SPOTLIGHT_LIMIT}`,
    );
    expect(res).toEqual({ top: [] });
  });

  it('calls getSpotlightData with custom limit', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ top: [] });

    let res;
    await act(async () => {
      res = await api.getSpotlightData(12);
    });

    expect(mockGet).toHaveBeenCalledWith(`/v1/spotlight/objects?select=top&limit=12`);
    expect(res).toEqual({ top: [] });
  });

  it('calls getSubscriptionsData with defaults', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: 'sub1' }]);

    let res;
    await act(async () => {
      res = await api.getSubscriptionsData();
    });

    const expectedUrl =
      `/v1/commerce/subscriptions?filter(group.buyers)` +
      `&offset=${DEFAULT_OFFSET}` +
      `&limit=${DEFAULT_PAGE_SIZE}`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual([{ id: 'sub1' }]);
  });

  it('calls getSubscriptionsData with custom values', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce([{ id: 'sub2' }]);

    let res;
    await act(async () => {
      res = await api.getSubscriptionsData(5, 10);
    });

    const expectedUrl =
      `/v1/commerce/subscriptions?filter(group.buyers)` + `&offset=5` + `&limit=10`;

    expect(mockGet).toHaveBeenCalledWith(expectedUrl);
    expect(res).toEqual([{ id: 'sub2' }]);
  });

  it('calls switchAccount and refreshAuth', async () => {
    const api = setup();
    mockPut.mockResolvedValueOnce(undefined);
    mockRefreshAuth.mockResolvedValueOnce(undefined);

    await act(async () => {
      await api.switchAccount('100', '200');
    });

    expect(mockPut).toHaveBeenCalledWith('/v1/accounts/users/100', {
      currentAccount: { id: '200' },
    });

    expect(mockRefreshAuth).toHaveBeenCalled();
  });

  it('throws when switching account without userId', async () => {
    const api = setup();

    await expect(
      act(async () => {
        await api.switchAccount('', '200');
      }),
    ).rejects.toThrow('User ID is required to switch accounts');

    expect(mockPut).not.toHaveBeenCalled();
  });

  it('logs warning when refreshAuth fails after account switch', async () => {
    const api = setup();

    mockPut.mockResolvedValueOnce(undefined);
    mockRefreshAuth.mockRejectedValueOnce(new Error('Refresh failed'));

    await act(async () => {
      await api.switchAccount('100', '200');
    });

    expect(mockPut).toHaveBeenCalledWith('/v1/accounts/users/100', {
      currentAccount: { id: '200' },
    });

    expect(logger.warn).toHaveBeenCalledWith('Failed to refresh token after account switch', {
      operation: 'switchAccount',
    });
  });

  it('calls getAccountData correctly', async () => {
    const api = setup();
    mockGet.mockResolvedValueOnce({ id: 'acc-123' });

    let res;
    await act(async () => {
      res = await api.getAccountData('acc-123');
    });

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/accounts/acc-123?select=audit,groups');
    expect(res).toEqual({ id: 'acc-123' });
  });

  it('throws when getAccountData fails', async () => {
    const api = setup();
    const error = new Error('API failure');
    mockGet.mockRejectedValueOnce(error);

    await expect(
      act(async () => {
        await api.getAccountData('acc-999');
      }),
    ).rejects.toThrow('API failure');

    expect(mockGet).toHaveBeenCalledWith('/v1/accounts/accounts/acc-999?select=audit,groups');
  });
});
