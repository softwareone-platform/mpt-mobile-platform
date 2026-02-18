import { InternalAxiosRequestConfig, AxiosError } from 'axios';

jest.mock('@/lib/tokenProvider');
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
import apiClient, { updateApiClientBaseURL } from '@/lib/apiClient';
import { getAccessTokenAsync } from '@/lib/tokenProvider';
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
