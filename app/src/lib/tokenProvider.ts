const subscribers = new Set<() => Promise<string | null>>();
let refreshFn: (() => Promise<string | null>) | null = null;

export const tokenProvider = {
  register(getTokenFn: () => Promise<string | null>) {
    subscribers.add(getTokenFn);

    // Return unregister function for cleanup
    return () => {
      subscribers.delete(getTokenFn);
    };
  },

  registerRefresh(fn: () => Promise<string | null>) {
    refreshFn = fn;

    return () => {
      refreshFn = null;
    };
  },

  // get latest token from the most recent subscriber
  async getToken() {
    const last = Array.from(subscribers).at(-1);
    return last ? last() : null;
  },

  async forceRefreshToken(): Promise<string | null> {
    return refreshFn ? refreshFn() : null;
  },
};

export async function getAccessTokenAsync(): Promise<string | null> {
  return tokenProvider.getToken();
}

export async function forceRefreshTokenAsync(): Promise<string | null> {
  return tokenProvider.forceRefreshToken();
}
