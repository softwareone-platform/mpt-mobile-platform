export type ApiError = {
  name: 'API Error';
  status: number | null;
  message: string;
  details?: any;
};

export const createApiError = (error: any): ApiError => {
  const status = error?.response?.status ?? null;
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Unexpected API Error';

  return {
    name: 'API Error',
    status,
    message,
    details: error?.response?.data,
  };
};
