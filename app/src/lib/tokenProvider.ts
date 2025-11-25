let getAccessToken: (() => Promise<string | null>) | null = null;

export const tokenProvider = {
  register(getTokenFn: () => Promise<string | null>) {
    getAccessToken = getTokenFn;
  },
};

export async function getAccessTokenAsync(): Promise<string | null> {
  if (!getAccessToken) return null;
  return getAccessToken();
}
