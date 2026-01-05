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
