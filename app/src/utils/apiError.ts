import { AxiosError } from 'axios';

export type ApiError = {
  name: 'API Error';
  status: number | null;
  message: string;
  details?: unknown;
};

export const createApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError?.response?.status ?? null;
  const message =
    axiosError?.response?.data?.message || axiosError?.message || 'Unexpected API Error';

  return {
    name: 'API Error',
    status,
    message,
    details: axiosError?.response?.data,
  };
};

export const isUnauthorisedError = (error: unknown): boolean => {
  // Narrow error to object first
  if (error === null || typeof error !== 'object') {
    return false;
  }

  // Check if it has a status property
  const apiError = error as ApiError;
  if (typeof apiError.status !== 'number') {
    return false;
  }

  // Finally, check if status is 401 or 403
  if (apiError.status === 401 || apiError.status === 403) {
    return true;
  }

  return false;
};
