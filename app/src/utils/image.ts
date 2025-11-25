export function getImageUrl(baseUrl: string, imagePath: string): string | null {
  if (!baseUrl || !imagePath) {
    return null;
  }

  return `${baseUrl}${imagePath}`
}

export function getImageHeaders(accessToken: string): { [key: string]: string } | null {
  try {
    if (!accessToken) {
      return null;
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'image/*',
    };
  } catch (error) {
    console.warn('Failed to get image headers: ', error);
    return null;
  }
}
