import { HttpMethod } from '@/types/api';

export function getImageUrl(baseUrl: string, imagePath: string): string | null {

   if (!baseUrl || !imagePath) {
    return null;
  }

  return `${baseUrl.replace(/\/+$/, "")}/${imagePath.replace(/^\/+/, "")}`;
}

export function getImageHeaders(
  accessToken: string,
  method: HttpMethod = HttpMethod.GET
): { [key: string]: string } | null {
  if (!accessToken) return null;

  const headers: { [key: string]: string } = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'image/*',
  };

  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}
