import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { configService } from '@/config/env.config';
import { createApiError } from '@/utils/apiError';
import { getAccessTokenAsync } from './tokenProvider';

const BASE_URL = configService.get('AUTH0_API_URL');

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds Authorization header automatically.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessTokenAsync();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(createApiError(error));
  }
);

/**
 * Response Interceptor
 * Converts all errors into ApiError type.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(createApiError(error));
  }
);

export default apiClient;
