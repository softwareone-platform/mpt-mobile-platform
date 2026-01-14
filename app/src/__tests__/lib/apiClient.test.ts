import { InternalAxiosRequestConfig, AxiosError } from 'axios';

import apiClient from '@/lib/apiClient';
import { getAccessTokenAsync } from '@/lib/tokenProvider';
import { createApiError } from '@/utils/apiError';

jest.mock('@/lib/tokenProvider');
jest.mock('@/utils/apiError');

describe('apiClient interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds Authorization header if token exists', async () => {
    (getAccessTokenAsync as jest.Mock).mockResolvedValue('mock-token');

    const config: InternalAxiosRequestConfig = {
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig;

    const result = await (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{
          fulfilled: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;
        }>;
      }
    ).handlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer mock-token');
  });

  it('does not add Authorization header if no token', async () => {
    (getAccessTokenAsync as jest.Mock).mockResolvedValue(null);

    const config: InternalAxiosRequestConfig = {
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig;

    const result = await (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{
          fulfilled: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;
        }>;
      }
    ).handlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('calls createApiError on request error', async () => {
    const mockError = new Error('fail');
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    await expect(
      (
        apiClient.interceptors.request as unknown as {
          handlers: Array<{ rejected: (error: Error) => Promise<never> }>;
        }
      ).handlers[0].rejected(mockError),
    ).rejects.toEqual({ name: 'API Error' });
  });

  it('calls createApiError on response error', async () => {
    const mockError: Partial<AxiosError> = { response: { status: 500 } as AxiosError['response'] };
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    const responseInterceptor = apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
    };

    await expect(responseInterceptor.handlers[0].rejected(mockError as AxiosError)).rejects.toEqual(
      {
        name: 'API Error',
      },
    );

    expect(createApiError).toHaveBeenCalledWith(mockError);
  });
});
