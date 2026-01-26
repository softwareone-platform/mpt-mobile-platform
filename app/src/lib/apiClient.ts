import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { getAccessTokenAsync } from './tokenProvider';

import { configService } from '@/config/env.config';
import { createApiError } from '@/utils/apiError';

const BASE_URL = configService.get('AUTH0_API_URL');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds Authorization header automatically unless noAuth flag is set.
 */
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

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(createApiError(error));
  },
);

/**
 * Response Interceptor
 * Converts all errors into ApiError type.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(createApiError(error));
  },
);

export default apiClient;
