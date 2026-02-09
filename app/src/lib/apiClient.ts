import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getAccessTokenAsync } from './tokenProvider';

import { configService } from '@/config/env.config';
import { appInsightsService } from '@/services/appInsightsService';
import { createApiError } from '@/utils/apiError';

const BASE_URL = configService.get('AUTH0_API_URL');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { noAuth?: boolean }) => {
    if (config.noAuth) {
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
  (error: AxiosError) => {
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
