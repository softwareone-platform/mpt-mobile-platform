import { renderHook } from '@testing-library/react-native';

import { DEFAULT_OFFSET, DEFAULT_PAGE_SIZE } from '@/constants/api';
import { useApi } from '@/hooks/useApi';
import { useContactsApi } from '@/services/contactsService';
import { logger } from '@/services/loggerService';
import type { PaginatedResponse } from '@/types/api';
import type { Contact } from '@/types/chat';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn(),
}));

jest.mock('@/services/loggerService', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGet = jest.fn();
const mockUseApi = useApi as jest.Mock;

const USER_ID = 'USR-1234-5678';

const mockContact: Contact = {
  id: 'CON-0001',
  email: 'alice@example.com',
  revision: 1,
  identity: { id: 'USR-0001', name: 'Alice', icon: undefined },
};

const mockResponse: PaginatedResponse<Contact> = {
  data: [mockContact],
  $meta: { pagination: { total: 1, offset: 0, limit: 50 } },
};

describe('useContactsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockReturnValue({ get: mockGet });
  });

  describe('getContacts', () => {
    it('calls the correct endpoint without search', async () => {
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContactsApi());
      await result.current.getContacts(USER_ID);

      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(`/v1/notifications/contacts`));
      const endpoint: string = mockGet.mock.calls[0][0];
      expect(endpoint).toContain(`ne(identity.id,"${USER_ID}")`);
      expect(endpoint).toContain(`eq(chat,true)`);
      expect(endpoint).toContain(`ne(status,"deleted")`);
      expect(endpoint).toContain(`any(directories)`);
      expect(endpoint).not.toContain('ilike');
    });

    it('wraps search term in ilike filter', async () => {
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContactsApi());
      await result.current.getContacts(USER_ID, DEFAULT_OFFSET, DEFAULT_PAGE_SIZE, 'alice');

      const endpoint: string = mockGet.mock.calls[0][0];
      expect(endpoint).toContain(`ilike(identity.name,"*alice*")`);
    });

    it('applies offset and limit to the endpoint', async () => {
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContactsApi());
      await result.current.getContacts(USER_ID, 10, 20);

      const endpoint: string = mockGet.mock.calls[0][0];
      expect(endpoint).toContain(`offset=10`);
      expect(endpoint).toContain(`limit=20`);
    });

    it('uses DEFAULT_OFFSET and DEFAULT_PAGE_SIZE when not provided', async () => {
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContactsApi());
      await result.current.getContacts(USER_ID);

      const endpoint: string = mockGet.mock.calls[0][0];
      expect(endpoint).toContain(`offset=${DEFAULT_OFFSET}`);
      expect(endpoint).toContain(`limit=${DEFAULT_PAGE_SIZE}`);
    });

    it('returns the api response', async () => {
      mockGet.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useContactsApi());
      const response = await result.current.getContacts(USER_ID);

      expect(response).toBe(mockResponse);
    });

    it('logs error and re-throws when the api call fails', async () => {
      const apiError = { status: 400, message: 'Bad Request', details: { title: 'Bad Request' } };
      mockGet.mockRejectedValue(apiError);

      const { result } = renderHook(() => useContactsApi());

      await expect(result.current.getContacts(USER_ID)).rejects.toBe(apiError);
      expect(logger.error).toHaveBeenCalledWith(
        '[ContactsService] Failed to fetch contacts',
        apiError,
        expect.objectContaining({ httpStatus: 400, errorMessage: 'Bad Request' }),
      );
    });
  });
});
