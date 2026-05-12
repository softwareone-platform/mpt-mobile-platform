import { InternalAxiosRequestConfig, AxiosError } from 'axios';

jest.mock('@/lib/tokenProvider', () => ({
  getAccessTokenAsync: jest.fn(),
  forceRefreshTokenAsync: jest.fn(),
}));
jest.mock('@/utils/apiError');
jest.mock('@/services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
    getTraceparent: jest.fn(() => '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01'),
    getRequestId: jest.fn(() => '|0af7651916cd43dd8448eb211c80319c.b9c7c989_'),
  },
}));
jest.mock('@/config/env.config', () => ({
  configService: {
    get: jest.fn((key: string) => {
      if (key === 'AUTH0_API_URL') return 'https://api.default.com';
      return '';
    }),
  },
}));

import { configService } from '@/config/env.config';
import { API_REQUEST_TIMEOUT_MS } from '@/constants/api';
import apiClient, { updateApiClientBaseURL } from '@/lib/apiClient';
import { forceRefreshTokenAsync, getAccessTokenAsync } from '@/lib/tokenProvider';
import { appInsightsService } from '@/services/appInsightsService';
import { createApiError } from '@/utils/apiError';

describe('apiClient interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds Authorization header with token', async () => {
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
    expect(result.headers['traceparent']).toBe(
      '00-0af7651916cd43dd8448eb211c80319c-00f067aa0ba902b7-01',
    );
    expect(result.headers['Request-Id']).toBe('|0af7651916cd43dd8448eb211c80319c.b9c7c989_');
  });

  it('skips Authorization with noAuth flag', async () => {
    const config: InternalAxiosRequestConfig & { noAuth?: boolean } = {
      headers: {} as InternalAxiosRequestConfig['headers'],
      noAuth: true,
    } as InternalAxiosRequestConfig & { noAuth?: boolean };

    const result = await (
      apiClient.interceptors.request as unknown as {
        handlers: Array<{
          fulfilled: (
            config: InternalAxiosRequestConfig & { noAuth?: boolean },
          ) => Promise<InternalAxiosRequestConfig>;
        }>;
      }
    ).handlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('tracks request interceptor errors', async () => {
    const mockError = new Error('fail');
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    await expect(
      (
        apiClient.interceptors.request as unknown as {
          handlers: Array<{ rejected: (error: Error) => Promise<never> }>;
        }
      ).handlers[0].rejected(mockError),
    ).rejects.toEqual({ name: 'API Error' });

    expect(appInsightsService.trackException).toHaveBeenCalledWith(
      { name: 'API Error' },
      { operation: 'apiRequestInterceptor' },
      'Error',
    );
  });

  it('tracks 5xx errors with Error severity', async () => {
    const mockError: Partial<AxiosError> = {
      response: { status: 500, statusText: 'Internal Server Error' } as AxiosError['response'],
      config: { url: '/api/test', method: 'get' } as AxiosError['config'],
    };
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    const responseInterceptor = apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
    };

    await expect(responseInterceptor.handlers[0].rejected(mockError as AxiosError)).rejects.toEqual(
      { name: 'API Error' },
    );

    expect(appInsightsService.trackException).toHaveBeenCalledWith(
      { name: 'API Error' },
      { url: '/api/test', method: 'GET', statusCode: 500, statusText: 'Internal Server Error' },
      'Error',
    );
  });

  it('tracks 4xx errors with Warning severity', async () => {
    const mockError: Partial<AxiosError> = {
      response: { status: 400, statusText: 'Bad Request' } as AxiosError['response'],
      config: { url: '/api/test', method: 'post' } as AxiosError['config'],
    };
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    const responseInterceptor = apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
    };

    await expect(responseInterceptor.handlers[0].rejected(mockError as AxiosError)).rejects.toEqual(
      { name: 'API Error' },
    );

    expect(appInsightsService.trackException).toHaveBeenCalledWith(
      { name: 'API Error' },
      { url: '/api/test', method: 'POST', statusCode: 400, statusText: 'Bad Request' },
      'Warning',
    );
  });

  it('handles missing config with fallback values', async () => {
    const mockError: Partial<AxiosError> = {
      response: { status: 404, statusText: 'Not Found' } as AxiosError['response'],
    };
    (createApiError as jest.Mock).mockReturnValue({ name: 'API Error' });

    const responseInterceptor = apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
    };

    await expect(responseInterceptor.handlers[0].rejected(mockError as AxiosError)).rejects.toEqual(
      { name: 'API Error' },
    );

    expect(appInsightsService.trackException).toHaveBeenCalledWith(
      { name: 'API Error' },
      { url: 'unknown', method: 'unknown', statusCode: 404, statusText: 'Not Found' },
      'Warning',
    );
  });

  it('has a 30s timeout configured', () => {
    expect(apiClient.defaults.timeout).toBe(API_REQUEST_TIMEOUT_MS);
  });

  describe('401 retry logic', () => {
    type ResponseErrorHandler = {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<unknown> }>;
    };

    const getResponseInterceptor = () =>
      apiClient.interceptors.response as unknown as ResponseErrorHandler;

    it('refreshes token and retries the request on 401', async () => {
      (forceRefreshTokenAsync as jest.Mock).mockResolvedValue('new-token');
      const requestSpy = jest
        .spyOn(apiClient, 'request')
        .mockResolvedValueOnce({ data: 'retried-ok' });

      const mockError: Partial<AxiosError> = {
        response: { status: 401, statusText: 'Unauthorized' } as AxiosError['response'],
        config: {
          url: '/api/resource',
          method: 'get',
          headers: {} as InternalAxiosRequestConfig['headers'],
        } as InternalAxiosRequestConfig,
      };

      const result = await getResponseInterceptor().handlers[0].rejected(mockError as AxiosError);

      expect(forceRefreshTokenAsync).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer new-token' }),
        }),
      );
      expect(result).toEqual({ data: 'retried-ok' });
      expect(createApiError).not.toHaveBeenCalled();
    });

    it('rejects with error and does not retry when refresh returns null', async () => {
      (forceRefreshTokenAsync as jest.Mock).mockResolvedValue(null);
      (createApiError as jest.Mock).mockReturnValue({ name: 'API Error', status: 401 });
      const requestSpy = jest.spyOn(apiClient, 'request');

      const mockError: Partial<AxiosError> = {
        response: { status: 401, statusText: 'Unauthorized' } as AxiosError['response'],
        config: {
          url: '/api/resource',
          method: 'get',
          headers: {} as InternalAxiosRequestConfig['headers'],
        } as InternalAxiosRequestConfig,
      };

      await expect(
        getResponseInterceptor().handlers[0].rejected(mockError as AxiosError),
      ).rejects.toEqual({ name: 'API Error', status: 401 });

      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('does not retry when _retried flag is already set', async () => {
      (createApiError as jest.Mock).mockReturnValue({ name: 'API Error', status: 401 });
      const requestSpy = jest.spyOn(apiClient, 'request');

      const mockError: Partial<AxiosError> = {
        response: { status: 401, statusText: 'Unauthorized' } as AxiosError['response'],
        config: {
          url: '/api/resource',
          method: 'get',
          headers: {} as InternalAxiosRequestConfig['headers'],
          _retried: true,
        } as InternalAxiosRequestConfig & { _retried?: boolean },
      };

      await expect(
        getResponseInterceptor().handlers[0].rejected(mockError as AxiosError),
      ).rejects.toEqual({ name: 'API Error', status: 401 });

      expect(forceRefreshTokenAsync).not.toHaveBeenCalled();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('passes non-401 errors through without retrying', async () => {
      (createApiError as jest.Mock).mockReturnValue({ name: 'API Error', status: 403 });

      const mockError: Partial<AxiosError> = {
        response: { status: 403, statusText: 'Forbidden' } as AxiosError['response'],
        config: {
          url: '/api/resource',
          method: 'get',
          headers: {} as InternalAxiosRequestConfig['headers'],
        } as InternalAxiosRequestConfig,
      };

      await expect(
        getResponseInterceptor().handlers[0].rejected(mockError as AxiosError),
      ).rejects.toEqual({ name: 'API Error', status: 403 });

      expect(forceRefreshTokenAsync).not.toHaveBeenCalled();
    });
  });
});

describe('updateApiClientBaseURL', () => {
  it('should update apiClient baseURL from config', () => {
    const mockConfigGet = configService.get as jest.Mock;
    mockConfigGet.mockReturnValue('https://api.newurl.com');

    updateApiClientBaseURL();

    expect(mockConfigGet).toHaveBeenCalledWith('AUTH0_API_URL');
    expect(apiClient.defaults.baseURL).toBe('https://api.newurl.com');
  });

  it('should handle empty baseURL', () => {
    const mockConfigGet = configService.get as jest.Mock;
    mockConfigGet.mockReturnValue('');

    updateApiClientBaseURL();

    expect(mockConfigGet).toHaveBeenCalledWith('AUTH0_API_URL');
    expect(apiClient.defaults.baseURL).toBe('');
  });
});
