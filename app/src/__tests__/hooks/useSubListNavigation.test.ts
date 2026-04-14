import { useNavigation } from '@react-navigation/native';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { SubListItem } from '@/types/navigation';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockQuery = `&eq(agreement.id, "123")`;

const mockSubList: SubListItem[] = [
  {
    name: 'subscriptions',
    roles: ['Client', 'Operations'],
    query: mockQuery,
  },
  {
    name: 'invoices',
    roles: ['Client', 'Operations'],
    query: mockQuery,
  },
  {
    name: 'statements',
    roles: ['Client', 'Operations'],
    query: mockQuery,
  },
  {
    name: 'journals',
    roles: ['Vendor', 'Operations'],
    query: mockQuery,
  },
];

describe('useSubListNavigation', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    jest.clearAllMocks();
  });

  it('navigates to subscriptions with nested params', async () => {
    const { result } = renderHook(() => useSubListNavigation());

    const item = mockSubList[0];
    const query = '&eq(agreement.id, "123")';

    result.current.navigateToSubListItem(item);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('subscriptions', {
        screen: 'subscriptionsRoot',
        params: { query },
      });
    });
  });

  it('navigates to invoices with query param', async () => {
    const { result } = renderHook(() => useSubListNavigation());

    const item = mockSubList[1];
    const query = '&eq(agreement.id, "123")';

    result.current.navigateToSubListItem(item);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('invoices', {
        query,
      });
    });
  });

  it('navigates to statements with query param', async () => {
    const { result } = renderHook(() => useSubListNavigation());

    const subList = mockSubList[2];
    const query = '&eq(agreement.id, "123")';

    result.current.navigateToSubListItem(subList);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('statements', {
        query,
      });
    });
  });

  it('navigates to journals with query param', async () => {
    const { result } = renderHook(() => useSubListNavigation());

    const item = mockSubList[3];

    result.current.navigateToSubListItem(item);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('journals', {
        query: item.query,
      });
    });
  });

  it('calls navigate exactly once', async () => {
    const item = mockSubList[3];

    const { result } = renderHook(() => useSubListNavigation());

    result.current.navigateToSubListItem(item);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
