import { useCallback, useMemo } from 'react';
import apiClient from '@/lib/apiClient';

// Pure API functions
export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiClient.get<T>(path);
  return res.data;
}

export async function apiPost<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await apiClient.post<T>(path, body);
  return res.data;
}

export async function apiPut<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await apiClient.put<T>(path, body);
  return res.data;
}

export async function apiPatch<T, B = unknown>(path: string, body?: B): Promise<T> {
  const res = await apiClient.patch<T>(path, body);
  return res.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiClient.delete<T>(path);
  return res.data;
}

export function useApi() {
  const get = useCallback(<T>(path: string) => apiGet<T>(path), []);
  const post = useCallback(<T, B = unknown>(path: string, body?: B) => apiPost<T, B>(path, body), []);
  const put = useCallback(<T, B = unknown>(path: string, body?: B) => apiPut<T, B>(path, body), []);
  const patch = useCallback(<T, B = unknown>(path: string, body?: B) => apiPatch<T, B>(path, body), []);
  const del = useCallback(<T>(path: string) => apiDelete<T>(path), []);

  return useMemo(
    () => ({
      get,
      post,
      put,
      patch,
      delete: del,
    }),
    [get, post, put, patch, del]
  );
}
