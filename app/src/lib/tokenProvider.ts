const subscribers = new Set<() => Promise<string | null>>();

export const tokenProvider = {
  register(getTokenFn: () => Promise<string | null>) {
    subscribers.add(getTokenFn);

    // Return unregister function for cleanup
    return () => {
      subscribers.delete(getTokenFn);
    };
  },

  // get latest token from the most recent subscriber
  async getToken() {
    const last = Array.from(subscribers).at(-1);
    return last ? last() : null;
  },
};

export async function getAccessTokenAsync(): Promise<string | null> {
  return tokenProvider.getToken();
}
