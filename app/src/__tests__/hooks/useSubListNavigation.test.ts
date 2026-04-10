import { useNavigation } from '@react-navigation/native';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useSubListNavigation } from '@/hooks/useSubListNavigation';
import type { SubListItem } from '@/types/navigation';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockSubList: SubListItem[] = [
  { name: 'subscriptions', roles: ['Client', 'Operations'] },
  { name: 'invoices', roles: ['Client', 'Operations'] },
  { name: 'statements', roles: ['Client', 'Operations'] },
  { name: 'journals', roles: ['Vendor', 'Operations'] },
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

    result.current.navigateToSubListItem(item, query);

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

    result.current.navigateToSubListItem(item, query);

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

    result.current.navigateToSubListItem(subList, query);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('statements', {
        query,
      });
    });
  });

  it('navigates to journals with query param', async () => {
    const { result } = renderHook(() => useSubListNavigation());

    const item = mockSubList[3];
    const query = '&eq(agreement.id, "123")';

    result.current.navigateToSubListItem(item, query);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('journals', {
        query,
      });
    });
  });

  it('calls navigate exactly once', async () => {
    const item = mockSubList[3];
    const query = '&eq(agreement.id, "123")';

    const { result } = renderHook(() => useSubListNavigation());

    result.current.navigateToSubListItem(item, query);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
