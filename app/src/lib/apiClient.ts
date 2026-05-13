import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { forceRefreshTokenAsync, getAccessTokenAsync } from './tokenProvider';

import { configService } from '@/config/env.config';
import { API_REQUEST_TIMEOUT_MS } from '@/constants/api';
import { appInsightsService } from '@/services/appInsightsService';
import { createApiError } from '@/utils/apiError';

type RetriableConfig = InternalAxiosRequestConfig & {
  _retried?: boolean;
  _noAuth?: boolean;
  noAuth?: boolean;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: configService.get('AUTH0_API_URL'),
  timeout: API_REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

export function updateApiClientBaseURL(): void {
  const newBaseURL = configService.get('AUTH0_API_URL');
  apiClient.defaults.baseURL = newBaseURL;
}

apiClient.interceptors.request.use(
  async (config: RetriableConfig) => {
    if (config.noAuth) {
      config._noAuth = true;
      delete config.noAuth;
      return config;
    }

    const token = await getAccessTokenAsync();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const traceparent = appInsightsService.getTraceparent();
    const requestId = appInsightsService.getRequestId();

    if (traceparent) {
      config.headers['traceparent'] = traceparent;
    }

    if (requestId) {
      config.headers['Request-Id'] = requestId;
    }

    return config;
  },
  (error: AxiosError) => {
    const apiError = createApiError(error);
    appInsightsService.trackException(apiError, { operation: 'apiRequestInterceptor' }, 'Error');
    return Promise.reject(apiError);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !originalRequest._noAuth
    ) {
      originalRequest._retried = true;
      const newToken = await forceRefreshTokenAsync();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      }
    }

    const apiError = createApiError(error);

    appInsightsService.trackException(
      apiError,
      {
        url: error.config?.url || 'unknown',
        method: error.config?.method?.toUpperCase() || 'unknown',
        statusCode: error.response?.status || 0,
        statusText: error.response?.statusText || 'unknown',
      },
      error.response?.status && error.response.status >= 500 ? 'Error' : 'Warning',
    );

    return Promise.reject(apiError);
  },
);

export default apiClient;
