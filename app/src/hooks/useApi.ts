import apiClient from "@/lib/apiClient";

export function useApi() {
  return {
    get: async <T>(path: string): Promise<T> => {
      const res = await apiClient.get<T>(path);
      return res.data;
    },
    post: async <T, B = unknown>(path: string, body?: B): Promise<T> => {
      const res = await apiClient.post<T>(path, body);
      return res.data;
    },
    put: async <T, B = unknown>(path: string, body?: B): Promise<T> => {
      const res = await apiClient.put<T>(path, body);
      return res.data;
    },
    patch: async <T, B = unknown>(path: string, body?: B): Promise<T> => {
      const res = await apiClient.patch<T>(path, body);
      return res.data;
    },
    delete: async <T>(path: string): Promise<T> => {
      const res = await apiClient.delete<T>(path);
      return res.data;
    },
  };
}
